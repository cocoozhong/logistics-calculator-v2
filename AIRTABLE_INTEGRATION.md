# Airtable 集成指南

## 概述

本项目已从硬编码的物流数据迁移到从 Airtable 动态获取数据。这样可以方便地管理和更新物流价格信息，无需修改代码。

## 设置步骤

### 1. 创建 Airtable Base

在 Airtable 中创建一个新的 Base，建议命名为 "物流价格数据"。

### 2. 设置表格结构

创建以下字段：

| 字段名 | 字段类型 | 说明 |
|--------|----------|------|
| 物流公司 | 单行文本 | 物流公司名称 |
| 地区 | 单行文本 | 格式：省份-城市 |
| 价格数据 | 长文本 | JSON 格式的价格信息 |
| 时效 | 单行文本 | 配送时效 |
| 备注 | 长文本 | 其他说明信息 |

### 3. 获取 API 凭据

#### API Token
1. 访问 [Airtable API Tokens](https://airtable.com/create/tokens)
2. 创建新的 Personal Access Token
3. 确保选择正确的 Scope（至少需要 `data.records:read`）

#### Base ID
1. 在您的 Airtable Base 页面
2. 查看 URL：`https://airtable.com/appXXXXXXXXXXXXXX/...`
3. `appXXXXXXXXXXXXXX` 就是您的 Base ID

### 4. 配置环境变量

在您的部署平台（如 Vercel）中设置以下环境变量：

```
AIRTABLE_API_TOKEN=your_actual_token_here
AIRTABLE_BASE_ID=your_actual_base_id_here
```

### 5. 数据格式示例

#### 新亮物流数据
```json
{
  "≤50kg": 120,
  "50-200kg": 2.5,
  "200-500kg": 2.2,
  "500-1000kg": 2.0,
  "1000-3000kg": 1.8,
  "≥3000kg": 1.6
}
```

#### 顺丰/申通数据
```json
{
  "first_kg": 15,
  "additional_per_kg": 8
}
```

#### 安能数据
```json
{
  "province": "江苏省",
  "cities": ["南京市", "苏州市"],
  "unit_price": 1.5
}
```

## 数据记录示例

### 新亮物流记录
- 物流公司: `新亮物流`
- 地区: `浙江省-杭州市`
- 价格数据: `{"≤50kg": 120, "50-200kg": 2.5, ...}`
- 时效: `1-2天`

### 顺丰快递记录
- 物流公司: `顺丰快递`
- 地区: `江苏省`
- 价格数据: `{"first_kg": 15, "additional_per_kg": 8}`
- 时效: `1天`

### 申通快递记录
- 物流公司: `申通快递`
- 地区: `广东省`
- 价格数据: `{"base": 12, "extra_per_kg": 6}`
- 时效: `2-3天`

### 安能标准记录
- 物流公司: `安能标准`
- 地区: `江苏省-南京市`
- 价格数据: `{"province": "江苏省", "cities": ["南京市"], "unit_price": 1.5}`
- 时效: `2-4天`

## 功能特性

### 已保留的功能
- ✅ 实时价格计算
- ✅ 多物流公司对比
- ✅ 价格高亮显示
- ✅ 一键复制功能
- ✅ 智能地址解析
- ✅ 移动端适配
- ✅ 利润计算器（完全独立）

### 新增功能
- ✅ 动态数据加载
- ✅ 加载状态显示
- ✅ 错误处理和重试
- ✅ 数据源可配置

## 故障排除

### 数据加载失败
1. 检查 API Token 是否正确
2. 检查 Base ID 是否正确
3. 检查网络连接
4. 检查 Airtable Base 的访问权限

### 价格计算异常
1. 检查 JSON 数据格式是否正确
2. 检查字段名称是否匹配
3. 查看浏览器控制台的错误信息

### 部署问题
1. 确保环境变量已正确设置
2. 检查部署平台的网络访问限制
3. 验证 API 调用是否超出限制

## 技术细节

### 文件结构
```
lib/
├── price-calculator.ts    # 价格计算逻辑（已修改为动态数据）
├── airtable-client.ts     # Airtable API 客户端
└── types.ts              # 类型定义

app/
└── page.tsx              # 主页面（已集成数据加载）
```

### API 调用流程
1. 页面加载时调用 `initializeLogisticsData()`
2. 从 Airtable 获取所有记录
3. 转换为内部数据格式
4. 设置到价格计算器中
5. 用户输入时实时计算价格

### 数据转换
Airtable 记录会被转换为以下结构：
```typescript
{
  prices: { data: {} },      // 新亮物流
  sf: { regions: {} },       // 顺丰
  shentong: { regions: {} }, // 申通
  anneng: { tables: { anneng: [], anneng_timed: [] } }
}
```

## 更新和维护

### 添加新的物流公司
1. 在 `airtable-client.ts` 中添加新的处理逻辑
2. 在 `price-calculator.ts` 中添加计算函数
3. 在 `types.ts` 中更新类型定义

### 修改价格计算逻辑
1. 编辑 `price-calculator.ts` 中的相应函数
2. 测试计算逻辑的正确性
3. 更新 Airtable 中的数据格式（如需要）

### 性能优化
- 考虑添加数据缓存机制
- 实现增量数据更新
- 添加数据预加载策略

## 联系支持

如有问题或需要技术支持，请通过以下方式联系：
- GitHub Issues
- 项目维护者邮箱
- 技术文档更新请求
