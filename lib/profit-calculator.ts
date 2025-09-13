import { NPointInputs, NPointOutputs, ProfitPointInputs, ProfitPointOutputs, CalculationRecord } from './types'

/**
 * N点售价计算
 * @param inputs 输入参数
 * @returns 计算结果
 */
export function calculateNPointPrice(inputs: NPointInputs): NPointOutputs | null {
  const { cost, profitRate } = inputs
  
  // 验证输入
  if (cost <= 0 || profitRate < 0 || profitRate >= 100) {
    return null
  }
  
  // 计算售价：售价 = 成本 / (1 - 利润率)
  const price = cost / (1 - profitRate / 100)
  
  // 计算利润：利润 = 售价 - 成本
  const profit = price - cost
  
  return {
    profit: Math.round(profit * 100) / 100,
    price: Math.round(price * 100) / 100,
    taxPrice: 0 // 不再计算税后价
  }
}

/**
 * 赚几个点计算
 * @param inputs 输入参数
 * @returns 计算结果
 */
export function calculateProfitPoint(inputs: ProfitPointInputs): ProfitPointOutputs | null {
  const { cost, price } = inputs
  
  // 验证输入
  if (cost <= 0 || price <= 0) {
    return null
  }
  
  // 计算利润率：利润率 = (售价 - 成本) / 售价 × 100
  const profitRate = ((price - cost) / price) * 100
  
  return {
    profitRate: Math.round(profitRate * 100) / 100
  }
}

/**
 * 格式化价格显示
 * @param price 价格
 * @returns 格式化后的价格字符串
 */
export function formatPrice(price: number): string {
  return price.toFixed(2)
}

/**
 * 复制到剪贴板
 * @param text 要复制的文本
 * @returns Promise<boolean>
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('复制失败:', error)
    return false
  }
}

/**
 * 保存计算记录到本地存储
 * @param record 计算记录
 */
export function saveCalculationRecord(record: CalculationRecord): void {
  try {
    const existingRecords = getCalculationHistory()
    
    // 检查是否已存在相同的记录（比较输入参数）
    const isDuplicate = existingRecords.some(existingRecord => {
      if (existingRecord.type !== record.type) return false
      
      // 比较输入参数
      const existingInputs = existingRecord.inputs
      const newInputs = record.inputs
      
      if (record.type === 'n-point') {
        return existingInputs.cost === newInputs.cost && 
               existingInputs.profitRate === newInputs.profitRate
      } else if (record.type === 'profit-point') {
        return existingInputs.cost === newInputs.cost && 
               existingInputs.price === newInputs.price
      }
      
      return false
    })
    
    // 如果不是重复记录，才保存
    if (!isDuplicate) {
      const newRecords = [record, ...existingRecords].slice(0, 5) // 只保留最近5条
      localStorage.setItem('profit_calculation_history', JSON.stringify(newRecords))
    }
  } catch (error) {
    console.error('保存历史记录失败:', error)
  }
}

/**
 * 获取计算历史记录
 * @returns 历史记录数组
 */
export function getCalculationHistory(): CalculationRecord[] {
  try {
    const history = localStorage.getItem('profit_calculation_history')
    return history ? JSON.parse(history) : []
  } catch (error) {
    console.error('获取历史记录失败:', error)
    return []
  }
}

/**
 * 清空计算历史记录
 */
export function clearCalculationHistory(): void {
  try {
    localStorage.removeItem('profit_calculation_history')
  } catch (error) {
    console.error('清空历史记录失败:', error)
  }
}
