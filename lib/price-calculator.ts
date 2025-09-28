import { PriceResult, ExpressCompany } from './types'
import pricesData from '../prices_updated.json'
import sfData from '../sf_wuxi.json'
import shentongData from '../shentong.json'
import annengData from '../anneng_logistics.json'
import { normalizeProvince, normalizeCity, fuzzyMatchCity } from './name-normalizer'

// 缓存计算结果，避免重复计算
const calculationCache = new Map<string, PriceResult[]>()
const CACHE_SIZE_LIMIT = 100 // 限制缓存大小

/**
 * 计算物流费用
 * @param province 省份
 * @param city 城市
 * @param weight 重量(kg)
 * @returns 各物流公司价格结果
 */
export function calculatePrices(province: string, city: string, weight: number): PriceResult[] {
  // 生成缓存键
  const cacheKey = `${province}-${city}-${weight}`
  
  // 检查缓存
  if (calculationCache.has(cacheKey)) {
    return calculationCache.get(cacheKey)!
  }
  
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

  // 计算安能标准（按城市优先，其次省份，按重量单价）
  const annengStd = calculateAnnengPriceWithDetail('standard', province, city, weight)
  if (annengStd.price !== null) {
    results.push({
      company: '安能标准',
      price: annengStd.price,
      currency: 'CNY',
      isCheapest: false,
      note: annengStd.note,
      leadTime: annengStd.leadTime
    })
  }

  // 计算安能定时达
  const annengTimed = calculateAnnengPriceWithDetail('timed', province, city, weight)
  if (annengTimed.price !== null) {
    results.push({
      company: '安能定时达',
      price: annengTimed.price,
      currency: 'CNY',
      isCheapest: false,
      note: annengTimed.note,
      leadTime: annengTimed.leadTime
    })
  }
  
  // 标记最便宜的价格
  if (results.length > 0) {
    const minPrice = Math.min(...results.map(r => r.price))
    results.forEach(result => {
      result.isCheapest = result.price === minPrice
    })
  }
  
  // 缓存结果
  if (calculationCache.size >= CACHE_SIZE_LIMIT) {
    // 清理最旧的缓存项
    const firstKey = calculationCache.keys().next().value
    if (firstKey) {
      calculationCache.delete(firstKey)
    }
  }
  calculationCache.set(cacheKey, results)
  
  return results.sort((a, b) => a.price - b.price)
}

/**
 * 根据省份尝试多种键名获取区域配置
 * 兼容：原始输入、省份标准化、标准化+“省”、标准化+“市”
 */
function getRegionByProvince(regions: any, province: string): any | null {
  const original = province
  const normalized = normalizeProvince(province)
  const candidates = [
    original,
    normalized,
    `${normalized}省`,
    `${normalized}市`
  ].filter(Boolean)
  for (const key of candidates) {
    if (regions && Object.prototype.hasOwnProperty.call(regions, key)) {
      return regions[key]
    }
  }
  return null
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
 * 限制：只计算20kg以内的包裹
 */
function calculateSFPriceWithDetail(province: string, weight: number): { price: number | null, note?: string } {
  try {
    // 顺丰限制：只计算20kg以内
    if (weight > 20) {
      return { price: null, note: '顺丰只支持20kg以内包裹，请选择其他物流商' }
    }
    
    const regionData = getRegionByProvince((sfData as any).regions, province)
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
      note: '基于省份的统一价格（≤20kg）'
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
    const regionData = getRegionByProvince((shentongData as any).regions, province)
    if (!regionData) {
      return { price: null, note: '该省份暂无数据' }
    }
    
    // 申通快递计费规则
    let price: number
    
    // 阶梯式计费地区（0-3kg）
    const tieredRegions = [
      '江苏省', '浙江省', '安徽省', '上海市', '北京市', '河北省', '天津市', '山东省', 
      '河南省', '湖北省', '湖南省', '江西省', '福建省', '广东省', '陕西省', '重庆市', 
      '山西省', '贵州省', '辽宁省', '吉林省', '广西', '云南省', '四川省', '黑龙江', '海南省'
    ]
    
    if (tieredRegions.includes(province)) {
      // 阶梯式计费地区
      if (weight <= 1) {
        price = 3.5  // 0-1kg固定价格
      } else if (weight <= 2) {
        price = 4.0  // 1.01-2kg固定价格
      } else if (weight <= 3) {
        price = 4.5  // 2.01-3kg固定价格
      } else {
        // 3kg以上：按续重单价分组
        let extraPerKg: number
        
        // 续重0.8元/kg：江苏省、浙江省、安徽省、上海市
        if (['江苏省', '浙江省', '安徽省', '上海市'].includes(province)) {
          extraPerKg = 0.8
        }
        // 续重1.6元/kg：北京市、河北省、天津市、山东省、河南省、湖北省、湖南省、江西省、福建省
        else if (['北京市', '河北省', '天津市', '山东省', '河南省', '湖北省', '湖南省', '江西省', '福建省'].includes(province)) {
          extraPerKg = 1.6
        }
        // 续重1.8元/kg：广东省
        else if (['广东省'].includes(province)) {
          extraPerKg = 1.8
        }
        // 续重2.2元/kg：陕西省、重庆市、山西省、贵州省、辽宁省、吉林省、广西、云南省、四川省、黑龙江
        else if (['陕西省', '重庆市', '山西省', '贵州省', '辽宁省', '吉林省', '广西', '云南省', '四川省', '黑龙江'].includes(province)) {
          extraPerKg = 2.2
        }
        // 续重3.5元/kg：海南省
        else if (['海南省'].includes(province)) {
          extraPerKg = 3.5
        }
        // 其他地区使用数据中的续重单价
        else {
          extraPerKg = regionData.extra_per_kg
        }
        
        // 3kg以上：面单3.5元 + 实际重量 × 续重单价
        price = 3.5 + weight * extraPerKg
      }
    } else {
      // 无阶梯式计费地区：只有续重
      let extraPerKg: number
      
      // 面单3.5，续重4：青海、宁夏、内蒙、甘肃
      if (['青海', '宁夏', '内蒙', '甘肃'].includes(province)) {
        extraPerKg = 4
      }
      // 面单3.5续重12元：新疆
      else if (['新疆'].includes(province)) {
        extraPerKg = 12
      }
      // 面单3.5续重15元：西藏
      else if (['西藏'].includes(province)) {
        extraPerKg = 15
      }
      // 其他地区使用数据中的续重单价
      else {
        extraPerKg = regionData.extra_per_kg
      }
      
      // 统一计费：面单3.5元 + 实际重量 × 续重单价
      price = 3.5 + weight * extraPerKg
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
 * 计算安能价格（标准/定时达）
 * 数据来源：anneng_logistics.json -> tables.anneng / tables.anneng_timed
 * 规则：15kg起运，5元固定面单费，单价*实际重量+5=总费用
 */
function calculateAnnengPriceWithDetail(
  product: 'standard' | 'timed',
  province: string,
  city: string,
  weight: number
): { price: number | null, leadTime: string, note?: string } {
  try {
    // 安能业务规则：起运 15kg（低于按15kg计），最大 70kg（超过提示咨询）
    if (weight > 70) {
      return { price: null, leadTime: '', note: '超过安能最大承运重量（≤70kg），请咨询物流商' }
    }
    const effectiveWeight = weight < 15 ? 15 : weight
    const tableKey = product === 'standard' ? 'anneng' : 'anneng_timed'
    const rows: any[] = (annengData as any).tables?.[tableKey] || []
    if (!rows.length) {
      return { price: null, leadTime: '', note: '暂无安能数据' }
    }

    const normalizedProvince = normalizeProvince(province)
    const normalizedCity = normalizeCity(city)

    // 城市优先匹配 - 使用模糊匹配
    let matched = rows.find(row => {
      if (!Array.isArray(row.cities)) return false
      return row.cities.some((c: string) => fuzzyMatchCity(normalizedCity, c))
    })

    // 省份兜底匹配 - 使用标准化匹配
    if (!matched) {
      matched = rows.find(row => {
        if (!row.province) return false
        const rowProvince = normalizeProvince(row.province)
        return rowProvince === normalizedProvince
      })
    }

    if (!matched) {
      return { price: null, leadTime: '', note: '该地区暂无安能报价' }
    }

    const unit = Number(matched.unit_price)
    if (!unit || weight <= 0) {
      return { price: null, leadTime: '', note: '参数不完整' }
    }

    // 新计算方式：单价*实际重量+5元固定面单费
    const price = unit * effectiveWeight + 5
    const leadTime = matched.time || ''
    const scope = matched.cities?.some((c: string) => fuzzyMatchCity(normalizedCity, c)) ? '城市精确' : '省份参考'
    const extra = weight < 15 ? '（起运按15kg计）' : ''
    return { price, leadTime, note: `安能${product === 'standard' ? '标准' : '定时达'} · ${scope}报价${extra}（含5元面单费）` }
  } catch (error) {
    console.error('计算安能价格失败:', error)
    return { price: null, leadTime: '', note: '计算失败' }
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
        // 使用省份参考价格
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
