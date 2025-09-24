# 环境变量配置说明

## 创建 .env.local 文件

请在项目根目录创建 `.env.local` 文件，内容如下：

```bash
# Airtable 配置
AIRTABLE_API_KEY=your_airtable_api_key_here
AIRTABLE_BASE_ID=your_airtable_base_id_here
AIRTABLE_TABLE_NAME=物流价格表
```

## 获取 Airtable 凭据

### 1. API Key
1. 访问 [Airtable API Tokens](https://airtable.com/create/tokens)
2. 创建新的 Personal Access Token
3. 确保选择正确的 Scope（至少需要 `data.records:read`）

### 2. Base ID
1. 在您的 Airtable Base 页面
2. 查看 URL：`https://airtable.com/appXXXXXXXXXXXXXX/...`
3. `appXXXXXXXXXXXXXX` 就是您的 Base ID

### 3. Table Name
在 Airtable Base 中创建的表格名称，例如：`物流价格表`

## 部署配置

### Vercel 部署
在 Vercel 项目设置中添加环境变量：
- `AIRTABLE_API_KEY`
- `AIRTABLE_BASE_ID` 
- `AIRTABLE_TABLE_NAME`

### 其他平台
根据部署平台的要求设置相应的环境变量。
