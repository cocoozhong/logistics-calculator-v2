# 🚀 物流计算器使用指南

## 📋 配置步骤

### 1. 环境变量配置

您已经有了 `.env.local` 文件，现在需要填入真实的 Airtable 凭据：

```bash
# .env.local
AIRTABLE_API_KEY=your_actual_airtable_api_key
AIRTABLE_BASE_ID=your_actual_airtable_base_id  
AIRTABLE_TABLE_NAME=物流价格表
```

### 2. Airtable 表格配置

您的表格结构已经完美匹配！字段包括：
- ✅ 规则名称
- ✅ 物流公司
- ✅ 所属客户
- ✅ 目的地
- ✅ ModelType
- ✅ MinimumCharge
- ✅ FirstWeightKg
- ✅ FirstWeightPrice
- ✅ AdditionalWeightPricePerKg
- ✅ Tiers
- ✅ Timeliness
- ✅ CompanyName
- ✅ ExceptionThresholdKg
- ✅ ExceptionFormula

## 🔧 计价模型说明

### 1. first_additional（首重续重模式）
**适用场景**：传统快递公司计价方式

**必需字段**：
- `FirstWeightPrice`：首重价格
- `FirstWeightKg`：首重重量（默认1kg）
- `AdditionalWeightPricePerKg`：续重单价

**可选字段**：
- `ExceptionThresholdKg`：例外阈值重量
- `ExceptionFormula`：例外公式（如 'per_kg_only'）

**示例数据**：
```
规则名称: 顺丰快递-江苏省
物流公司: 顺丰快递
目的地: 江苏省
ModelType: first_additional
FirstWeightPrice: 15
FirstWeightKg: 1
AdditionalWeightPricePerKg: 8
ExceptionThresholdKg: 50
ExceptionFormula: per_kg_only
Timeliness: 1-2天
```

### 2. tiered_minimum_charge（分段起步价模式）
**适用场景**：有起步价保护的分段计价

**必需字段**：
- `MinimumCharge`：起步价
- `Tiers`：价格分段（JSON格式）

**示例数据**：
```
规则名称: 新亮物流-杭州市
物流公司: 新亮物流
目的地: 浙江省-杭州市
ModelType: tiered_minimum_charge
MinimumCharge: 100
Tiers: [{"upToKg": 50, "flatPrice": 120}, {"upToKg": 200, "pricePerKg": 2.5}, {"upToKg": null, "pricePerKg": 2.0}]
Timeliness: 2-3天
```

### 3. complex_tiered（复杂分段模式）
**适用场景**：复杂的多段式计价，支持进位规则

**必需字段**：
- `Tiers`：价格分段（JSON格式）

**可选字段**：
- 在 Tiers 中可设置 `rounding` 字段

**示例数据**：
```
规则名称: 安能标准-江苏省
物流公司: 安能标准
目的地: 江苏省
ModelType: complex_tiered
Tiers: [{"upToKg": 15, "flatPrice": 20}, {"upToKg": 50, "pricePerKg": 1.5, "baseFee": 10}, {"upToKg": null, "pricePerKg": 1.2, "rounding": "up_to_0.2"}]
Timeliness: 2-4天
```

## 🎯 目的地匹配规则

系统支持灵活的目的地匹配：

1. **精确匹配**：`江苏省` 匹配 `江苏省`
2. **城市匹配**：`杭州市` 匹配 `杭州市`
3. **省份-城市格式**：`浙江省-杭州市` 匹配 `浙江省` 或 `杭州市`
4. **包含匹配**：`江苏` 匹配 `江苏省`
5. **通用规则**：目的地为空时适用于所有地区

## 📊 Tiers 字段 JSON 格式

### 基础格式
```json
[
  {
    "upToKg": 50,
    "flatPrice": 120
  },
  {
    "upToKg": 200,
    "pricePerKg": 2.5
  },
  {
    "upToKg": null,
    "pricePerKg": 2.0
  }
]
```

### 字段说明
- `upToKg`：重量上限（null 表示无穷大）
- `flatPrice`：该区间的固定价格
- `pricePerKg`：该区间的每公斤单价
- `baseFee`：该区间的固定基础费用

## 🚀 测试和部署

### 本地测试
```bash
# 1. 确保 .env.local 文件配置正确
# 2. 启动开发服务器
npm run dev

# 3. 访问 http://localhost:3000
# 4. 查看浏览器控制台的调试信息
```

### 生产部署
```bash
# 1. 构建项目
npm run build

# 2. 在部署平台设置环境变量：
# - AIRTABLE_API_KEY
# - AIRTABLE_BASE_ID
# - AIRTABLE_TABLE_NAME

# 3. 部署
npm run start
```

## 🔍 调试和故障排除

### 常见问题

1. **数据加载失败**
   - 检查 API Key 是否正确
   - 检查 Base ID 是否正确
   - 检查表格名称是否匹配

2. **价格计算异常**
   - 查看浏览器控制台的错误信息
   - 检查 JSON 格式是否正确
   - 验证必需字段是否填写

3. **目的地不匹配**
   - 检查目的地字段的格式
   - 确认省份/城市名称的一致性

### 调试信息

系统会在控制台输出详细的调试信息：
- 加载的规则数量
- 规则处理状态
- 价格计算结果
- 错误详情

## 📝 最佳实践

1. **规则命名**：使用清晰的规则名称，如 `顺丰快递-江苏省`
2. **目的地格式**：推荐使用 `省份-城市` 格式
3. **JSON 格式**：使用在线 JSON 验证工具检查 Tiers 格式
4. **测试数据**：先用少量测试数据验证功能
5. **备份数据**：定期备份 Airtable 数据

## 🎉 完成！

您的物流计算器现在已经完全配置好了！可以开始添加价格数据并测试功能了。
