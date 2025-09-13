import { PriceResult, ExpressCompany } from './types'
import pricesData from '../prices_updated.json'
import sfData from '../data/sf_wuxi.json'
import shentongData from '../data/shentong.json'

/**
 * 计算物流费用
 * @param province 省份
 * @param city 城市
 * @param weight 重量(kg)
 * @returns 各物流公司价格结果
 */
export function calculatePrices(province: string, city: string, weight: number): PriceResult[] {
  const results: PriceResult[] = []
  
  // 计算新亮物流价格（需要具体城市）
  const xinliangResult = calculateXinliangPriceWithDetail(province, city, weight)
  if (xinliangResult.price !== null) {
    results.push({
      company: '新亮物流',
      price: xinliangResult.price,
      currency: 'CNY',
      leadTime: xinliangResult.leadTime,
      isCheapest: false,
      note: xinliangResult.note
    })
  }
  
  // 计算顺丰价格（省份级别即可）
  const sfResult = calculateSFPriceWithDetail(province, weight)
  if (sfResult.price !== null) {
    results.push({
      company: '顺丰快递',
      price: sfResult.price,
      currency: 'CNY',
      isCheapest: false,
      note: sfResult.note
    })
  }
  
  // 计算申通价格（省份级别即可）
  const shentongResult = calculateShentongPriceWithDetail(province, weight)
  if (shentongResult.price !== null) {
    results.push({
      company: '申通快递',
      price: shentongResult.price,
      currency: 'CNY',
      isCheapest: false,
      note: shentongResult.note
    })
  }
  
  // 标记最便宜的价格
  if (results.length > 0) {
    const minPrice = Math.min(...results.map(r => r.price))
    results.forEach(result => {
      result.isCheapest = result.price === minPrice
    })
  }
  
  return results.sort((a, b) => a.price - b.price)
}

/**
 * 计算新亮物流价格（智能版本）
 */
function calculateXinliangPriceWithDetail(province: string, city: string, weight: number): { price: number | null, leadTime: string, note?: string } {
  try {
    const provinceData = (pricesData.data as any)[province]
    if (!provinceData) {
      return { price: null, leadTime: '', note: '该省份暂无数据' }
    }
    
    // 如果有具体城市，优先使用城市数据
    if (city && city.trim()) {
      const cityData = (provinceData as any)[city]
      if (cityData) {
        const price = calculatePriceByWeight(cityData.rates, weight)
        return { 
          price, 
          leadTime: cityData.lead_time_days || '',
          note: `基于${city}的精确价格`
        }
      }
    }
    
    // 如果没有城市或城市不存在，使用省份参考价格
    const cities = Object.keys(provinceData)
    if (cities.length > 0) {
      const cityData = (provinceData as any)[cities[0]]
      const price = calculatePriceByWeight(cityData.rates, weight)
      return { 
        price, 
        leadTime: cityData.lead_time_days || '',
        note: `基于${cities[0]}的参考价格，请提供具体城市获得精确报价`
      }
    }
    
    return { price: null, leadTime: '', note: '暂无价格数据' }
  } catch (error) {
    console.error('计算新亮物流价格失败:', error)
    return { price: null, leadTime: '', note: '计算失败' }
  }
}

/**
 * 计算顺丰价格（智能版本）
 */
function calculateSFPriceWithDetail(province: string, weight: number): { price: number | null, note?: string } {
  try {
    const regionData = (sfData.regions as any)[province]
    if (!regionData) {
      return { price: null, note: '该省份暂无数据' }
    }
    
    const firstKg = regionData.first_kg
    const additionalPerKg = regionData.additional_per_kg
    
    let price: number
    if (weight <= 1) {
      price = firstKg
    } else {
      price = firstKg + (weight - 1) * additionalPerKg
    }
    
    return { 
      price, 
      note: '基于省份的统一价格'
    }
  } catch (error) {
    console.error('计算顺丰价格失败:', error)
    return { price: null, note: '计算失败' }
  }
}

/**
 * 计算申通价格（智能版本）
 */
function calculateShentongPriceWithDetail(province: string, weight: number): { price: number | null, note?: string } {
  try {
    const regionData = (shentongData.regions as any)[province]
    if (!regionData) {
      return { price: null, note: '该省份暂无数据' }
    }
    
    const base = regionData.base
    const extraPerKg = regionData.extra_per_kg
    
    let price: number
    if (weight <= 1) {
      price = base
    } else {
      price = base + (weight - 1) * extraPerKg
    }
    
    return { 
      price, 
      note: '基于省份的统一价格'
    }
  } catch (error) {
    console.error('计算申通价格失败:', error)
    return { price: null, note: '计算失败' }
  }
}

/**
 * 根据重量档位计算价格
 */
function calculatePriceByWeight(rates: any, weight: number): number | null {
  if (weight <= 50) {
    return rates['≤50kg'] || null
  } else if (weight <= 200) {
    return rates['50-200kg'] ? rates['50-200kg'] * weight : null
  } else if (weight <= 500) {
    return rates['200-500kg'] ? rates['200-500kg'] * weight : null
  } else if (weight <= 1000) {
    return rates['500-1000kg'] ? rates['500-1000kg'] * weight : null
  } else if (weight <= 3000) {
    return rates['1000-3000kg'] ? rates['1000-3000kg'] * weight : null
  } else {
    return rates['≥3000kg'] ? rates['≥3000kg'] * weight : null
  }
}

/**
 * 计算新亮物流价格（原版本，保留兼容性）
 */
function calculateXinliangPrice(province: string, city: string, weight: number): number | null {
  try {
    const provinceData = (pricesData.data as any)[province]
    if (!provinceData) return null
    
    // 优先使用城市数据，如果没有则使用省份数据
    let cityData = (provinceData as any)[city]
    if (!cityData || city === '') {
      // 如果城市不存在或为空，使用省份的参考数据
      // 查找省份下的第一个城市作为参考
      const cities = Object.keys(provinceData)
      if (cities.length > 0) {
        cityData = (provinceData as any)[cities[0]]
        console.log(`使用省份 ${province} 的参考价格（基于 ${cities[0]}）`)
      }
    }
    
    if (!cityData) return null
    
    const rates = cityData.rates
    
    // 根据重量选择价格档位
    if (weight <= 50) {
      // ≤50kg 是固定价格
      return rates['≤50kg'] || null
    } else if (weight <= 200) {
      // 50-200kg 按重量计算
      return rates['50-200kg'] ? rates['50-200kg'] * weight : null
    } else if (weight <= 500) {
      // 200-500kg 按重量计算
      return rates['200-500kg'] ? rates['200-500kg'] * weight : null
    } else if (weight <= 1000) {
      // 500-1000kg 按重量计算
      return rates['500-1000kg'] ? rates['500-1000kg'] * weight : null
    } else if (weight <= 3000) {
      // 1000-3000kg 按重量计算
      return rates['1000-3000kg'] ? rates['1000-3000kg'] * weight : null
    } else {
      // ≥3000kg 按重量计算
      return rates['≥3000kg'] ? rates['≥3000kg'] * weight : null
    }
  } catch (error) {
    console.error('计算新亮物流价格失败:', error)
    return null
  }
}

/**
 * 计算顺丰价格
 */
function calculateSFPrice(province: string, weight: number): number | null {
  try {
    const regionData = (sfData.regions as any)[province]
    if (!regionData) return null
    
    const firstKg = regionData.first_kg
    const additionalPerKg = regionData.additional_per_kg
    
    if (weight <= 1) {
      return firstKg
    } else {
      return firstKg + (weight - 1) * additionalPerKg
    }
  } catch (error) {
    console.error('计算顺丰价格失败:', error)
    return null
  }
}

/**
 * 计算申通价格
 */
function calculateShentongPrice(province: string, weight: number): number | null {
  try {
    const regionData = (shentongData.regions as any)[province]
    if (!regionData) return null
    
    const base = regionData.base
    const extraPerKg = regionData.extra_per_kg
    
    if (weight <= 1) {
      return base
    } else {
      return base + (weight - 1) * extraPerKg
    }
  } catch (error) {
    console.error('计算申通价格失败:', error)
    return null
  }
}

/**
 * 获取配送时效
 */
function getLeadTime(province: string, city: string): string {
  try {
    const provinceData = (pricesData.data as any)[province]
    if (!provinceData) return ''
    
    // 优先使用城市数据，如果没有则使用省份数据
    let cityData = (provinceData as any)[city]
    if (!cityData || city === '') {
      // 如果城市不存在或为空，使用省份下第一个城市的时效
      const cities = Object.keys(provinceData)
      if (cities.length > 0) {
        cityData = (provinceData as any)[cities[0]]
      }
    }
    
    if (!cityData) return ''
    
    return cityData.lead_time_days || ''
  } catch (error) {
    console.error('获取配送时效失败:', error)
    return ''
  }
}

/**
 * 格式化价格显示
 */
export function formatPrice(price: number, currency: string = 'CNY'): string {
  return `¥${price.toFixed(2)}`
}

/**
 * 获取价格差异百分比
 */
export function getPriceDifference(price1: number, price2: number): number {
  if (price2 === 0) return 0
  return ((price1 - price2) / price2) * 100
}
