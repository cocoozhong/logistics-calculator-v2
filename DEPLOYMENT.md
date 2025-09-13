# 🚀 部署指南

## GitHub Pages 部署

### 1. 准备工作

1. **Fork 项目**
   - 访问项目仓库
   - 点击 "Fork" 按钮创建你的副本

2. **修改配置**
   - 在 `package.json` 中修改 `homepage` 字段为你的 GitHub 用户名
   - 在 `next.config.js` 中修改 `assetPrefix` 和 `basePath` 为你的仓库名

### 2. 启用 GitHub Pages

1. 进入你的仓库设置页面
2. 滚动到 "Pages" 部分
3. 在 "Source" 下选择 "GitHub Actions"
4. 保存设置

### 3. 自动部署

当你推送代码到 `main` 分支时，GitHub Actions 会自动：
- 安装依赖
- 构建项目
- 部署到 GitHub Pages

### 4. 访问你的网站

部署完成后，你的网站将在以下地址可用：
```
https://你的用户名.github.io/logistics-calculator
```

## 本地开发

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本
```bash
npm run build
```

## 自定义配置

### 修改物流公司数据

1. 编辑 `data/` 目录下的 JSON 文件
2. 更新价格和地区信息
3. 重新部署

### 添加新的物流公司

1. 在 `data/` 目录添加新的 JSON 文件
2. 在 `lib/price-calculator.ts` 中添加计算逻辑
3. 更新 `lib/types.ts` 中的类型定义

### 自定义样式

- 修改 `app/globals.css` 中的 CSS 变量
- 更新 `tailwind.config.js` 中的主题配置

## 故障排除

### 常见问题

1. **部署失败**
   - 检查 GitHub Actions 日志
   - 确保所有依赖都正确安装

2. **页面无法访问**
   - 检查仓库设置中的 Pages 配置
   - 确认 GitHub Actions 工作流已成功运行

3. **样式问题**
   - 清除浏览器缓存
   - 检查 Tailwind CSS 配置

### 获取帮助

如果遇到问题，请：
1. 检查 GitHub Issues
2. 创建新的 Issue 描述问题
3. 提供详细的错误信息和步骤

## 性能优化

### 生产环境优化

1. **图片优化**
   - 使用 WebP 格式
   - 压缩图片大小

2. **代码分割**
   - Next.js 自动处理代码分割
   - 使用动态导入优化加载

3. **缓存策略**
   - 配置适当的缓存头
   - 使用 CDN 加速

## 安全考虑

1. **环境变量**
   - 不要在代码中硬编码敏感信息
   - 使用环境变量管理配置

2. **依赖安全**
   - 定期更新依赖包
   - 使用 `npm audit` 检查安全漏洞

3. **内容安全策略**
   - 配置 CSP 头
   - 限制外部资源加载
