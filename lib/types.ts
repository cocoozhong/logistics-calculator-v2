// 物流公司类型
export type ExpressCompany = '顺丰快递' | '申通快递' | '新亮物流' | '安能标准' | '安能定时达' | string

// 地址信息类型
export interface AddressInfo {
  province: string
  city: string
  fullAddress: string
  name?: string
  phone?: string
}

// 解析后的地址信息
export interface ParsedAddress {
  province: string
  city: string
  name?: string
  phone?: string
  address: string
}

// 价格计算结果
export interface PriceResult {
  company: ExpressCompany
  price: number
  currency: string
  leadTime?: string
  isCheapest: boolean
  note?: string
}

// 输入模式
export type InputMode = 'text' | 'select'

// 表单数据
export interface FormData {
  mode: InputMode
  textInput: string
  selectedProvince: string
  selectedCity: string
  weight: number
}

// 物流公司价格配置
export interface ExpressConfig {
  company: ExpressCompany
  currency: string
  unit: string
  rateModel: string
  data: any
}

// 省份城市数据
export interface ProvinceCity {
  province: string
  cities: string[]
}

// 搜索结果
export interface SearchResult {
  province: string
  city: string
  fullName: string
}

// 利润计算器类型
export interface NPointInputs {
  cost: number        // 成本
  profitRate: number  // 利润率
  taxRate: number     // 税点
}

export interface NPointOutputs {
  profit: number      // 利润
  price: number       // 售价
  taxPrice: number    // 税后价
}

export interface ProfitPointInputs {
  cost: number        // 成本
  price: number       // 售价
}

export interface ProfitPointOutputs {
  profitRate: number  // 利润率
}

export interface CalculationRecord {
  id: string
  type: 'n-point' | 'profit-point'
  inputs: Record<string, number>
  outputs: Record<string, number>
  timestamp: number
}

// 计算器类型
export type CalculatorType = 'logistics' | 'profit'
