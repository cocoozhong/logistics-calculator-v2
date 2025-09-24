# Cloudflare Pages 部署指南

## 🚀 部署概述

本项目已配置为支持 Cloudflare Pages 静态部署，通过静态导出模式实现高性能的全球 CDN 分发。

## 📋 部署前准备

### 1. 环境变量配置

在 Cloudflare Pages 部署前，需要配置以下环境变量：

```bash
# Airtable 配置
AIRTABLE_API_KEY=your_airtable_api_key_here
AIRTABLE_BASE_ID=your_airtable_base_id_here
AIRTABLE_TABLE_NAME=物流价格表
```

### 2. 获取 Airtable 凭据

#### API Key
1. 访问 [Airtable API Tokens](https://airtable.com/create/tokens)
2. 创建新的 Personal Access Token
3. 确保选择正确的 Scope（至少需要 `data.records:read`）

#### Base ID
1. 在您的 Airtable Base 页面
2. 查看 URL：`https://airtable.com/appXXXXXXXXXXXXXX/...`
3. `appXXXXXXXXXXXXXX` 就是您的 Base ID

#### Table Name
在 Airtable Base 中创建的表格名称，例如：`物流价格表`

## 🔧 部署步骤

### 方法一：通过 Cloudflare Dashboard

1. **登录 Cloudflare Dashboard**
   - 访问 [Cloudflare Dashboard](https://dash.cloudflare.com)
   - 登录您的账户

2. **创建 Pages 项目**
   - 点击左侧菜单的 "Pages"
   - 点击 "Create a project"
   - 选择 "Connect to Git"

3. **连接 Git 仓库**
   - 选择您的 Git 提供商（GitHub/GitLab/Bitbucket）
   - 授权 Cloudflare 访问您的仓库
   - 选择本项目仓库

4. **配置构建设置**
   ```
   Project name: logistics-calculator
   Production branch: main
   Framework preset: Next.js (Static HTML Export)
   Build command: npm run build:static
   Build output directory: dist
   Root directory: /
   ```

5. **设置环境变量**
   - 在项目设置中找到 "Environment variables"
   - 添加以下变量：
     - `AIRTABLE_API_KEY`
     - `AIRTABLE_BASE_ID`
     - `AIRTABLE_TABLE_NAME`

6. **部署**
   - 点击 "Save and Deploy"
   - 等待构建完成

### 方法二：通过 Wrangler CLI

1. **安装 Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **登录 Cloudflare**
   ```bash
   wrangler login
   ```

3. **构建项目**
   ```bash
   npm run build:static
   ```

4. **部署到 Pages**
   ```bash
   wrangler pages publish dist --project-name=logistics-calculator
   ```

## 📁 项目结构

部署后的项目结构：
```
dist/
├── _next/
│   ├── static/
│   └── ...
├── _headers
├── _redirects
├── index.html
├── profit/
│   └── index.html
└── ...
```

## ⚙️ 配置文件说明

### next.config.js
```javascript
const nextConfig = {
  trailingSlash: true,
  output: 'export',          // 启用静态导出
  distDir: 'dist',           // 输出目录
  images: {
    unoptimized: true        // 禁用图片优化
  },
  experimental: {
    esmExternals: false      // 禁用 ESM 外部化
  }
}
```

### public/_headers
设置 HTTP 头部和安全策略：
- 静态资源缓存策略
- 安全头部设置
- CORS 配置

### public/_redirects
处理路由重定向：
- SPA 路由支持
- API 重定向（如需要）

## 🔍 本地测试

在部署前，建议先在本地测试静态导出：

```bash
# 安装依赖
npm install

# 构建静态版本
npm run build:static

# 本地预览
npm run preview
```

访问 `http://localhost:3000` 检查应用是否正常工作。

## 🚨 常见问题

### 1. 构建失败
- 检查环境变量是否正确设置
- 确保 Airtable API 权限配置正确
- 查看构建日志中的具体错误信息

### 2. 数据加载失败
- 验证 Airtable API Key 是否有效
- 检查 Base ID 和 Table Name 是否正确
- 确认 Airtable 表格结构是否符合要求

### 3. 路由问题
- 确保所有路由都有对应的 HTML 文件
- 检查 `_redirects` 文件配置
- 验证 Next.js 路由配置

### 4. 样式问题
- 检查 Tailwind CSS 是否正确构建
- 验证静态资源路径是否正确
- 确认 CSS 文件是否被正确包含

## 📊 性能优化

### 1. 缓存策略
- 静态资源设置长期缓存
- HTML 文件设置短期缓存
- API 数据设置适当缓存

### 2. CDN 优化
- 利用 Cloudflare 全球 CDN
- 启用 Brotli 压缩
- 配置边缘缓存

### 3. 资源优化
- 图片使用 WebP 格式
- 启用代码分割
- 优化字体加载

## 🔄 自动部署

### GitHub Actions 集成

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build:static
      env:
        AIRTABLE_API_KEY: ${{ secrets.AIRTABLE_API_KEY }}
        AIRTABLE_BASE_ID: ${{ secrets.AIRTABLE_BASE_ID }}
        AIRTABLE_TABLE_NAME: ${{ secrets.AIRTABLE_TABLE_NAME }}
    
    - name: Deploy to Cloudflare Pages
      uses: cloudflare/pages-action@v1
      with:
        apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        projectName: logistics-calculator
        directory: dist
```

## 📞 技术支持

如遇到部署问题，请检查：
1. Cloudflare Pages 构建日志
2. 浏览器控制台错误信息
3. 网络请求状态
4. Airtable API 响应

## 🔗 相关链接

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Next.js 静态导出](https://nextjs.org/docs/advanced-features/static-html-export)
- [Airtable API 文档](https://airtable.com/developers/web/api/introduction)
