/**
 * Airtable 客户端 - 用于从 Airtable 获取物流价格数据
 * 
 * 使用说明：
 * 1. 在 Airtable 中创建表格，包含以下字段结构：
 *    - 物流公司名称
 *    - 省份/城市
 *    - 价格数据（JSON格式）
 *    - 时效信息
 * 
 * 2. 获取 Airtable API Token 和 Base ID
 * 3. 配置环境变量或直接在此文件中设置
 */

// Airtable 配置
const AIRTABLE_CONFIG = {
  // TODO: 替换为您的 Airtable API Token
  apiToken: process.env.AIRTABLE_API_TOKEN || 'your_airtable_api_token_here',
  // TODO: 替换为您的 Airtable Base ID
  baseId: process.env.AIRTABLE_BASE_ID || 'your_airtable_base_id_here',
  // TODO: 替换为您的表格名称
  tableName: 'LogisticsPrices'
}

/**
 * 从 Airtable 获取物流价格数据
 * @returns Promise<any> 物流价格数据
 */
export async function fetchLogisticsDataFromAirtable(): Promise<any> {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableName}`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.apiToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Airtable API 请求失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // 将 Airtable 数据转换为内部格式
    return transformAirtableData(data.records)
  } catch (error) {
    console.error('从 Airtable 获取数据失败:', error)
    throw error
  }
}

/**
 * 将 Airtable 数据转换为内部格式
 * @param records Airtable 记录
 * @returns 转换后的数据格式
 */
function transformAirtableData(records: any[]): any {
  const logisticsData: any = {
    prices: { data: {} },    // 新亮物流数据
    sf: { regions: {} },     // 顺丰数据
    shentong: { regions: {} }, // 申通数据
    anneng: { tables: { anneng: [], anneng_timed: [] } } // 安能数据
  }

  records.forEach((record: any) => {
    const fields = record.fields
    const company = fields['物流公司'] || fields['Company']
    const region = fields['地区'] || fields['Region']
    const priceData = fields['价格数据'] || fields['PriceData']
    const leadTime = fields['时效'] || fields['LeadTime']

    // 根据物流公司类型处理数据
    switch (company) {
      case '新亮物流':
      case 'Xinliang':
        if (region && priceData) {
          const [province, city] = region.split('-')
          if (!logisticsData.prices.data[province]) {
            logisticsData.prices.data[province] = {}
          }
          logisticsData.prices.data[province][city] = {
            rates: typeof priceData === 'string' ? JSON.parse(priceData) : priceData,
            lead_time_days: leadTime
          }
        }
        break

      case '顺丰快递':
      case 'SF':
        if (region && priceData) {
          const priceInfo = typeof priceData === 'string' ? JSON.parse(priceData) : priceData
          logisticsData.sf.regions[region] = {
            first_kg: priceInfo.first_kg,
            additional_per_kg: priceInfo.additional_per_kg
          }
        }
        break

      case '申通快递':
      case 'Shentong':
        if (region && priceData) {
          const priceInfo = typeof priceData === 'string' ? JSON.parse(priceData) : priceData
          logisticsData.shentong.regions[region] = {
            base: priceInfo.base,
            extra_per_kg: priceInfo.extra_per_kg
          }
        }
        break

      case '安能标准':
      case 'Anneng Standard':
        if (region && priceData) {
          const priceInfo = typeof priceData === 'string' ? JSON.parse(priceData) : priceData
          logisticsData.anneng.tables.anneng.push({
            province: priceInfo.province,
            cities: priceInfo.cities,
            unit_price: priceInfo.unit_price,
            time: leadTime
          })
        }
        break

      case '安能定时达':
      case 'Anneng Timed':
        if (region && priceData) {
          const priceInfo = typeof priceData === 'string' ? JSON.parse(priceData) : priceData
          logisticsData.anneng.tables.anneng_timed.push({
            province: priceInfo.province,
            cities: priceInfo.cities,
            unit_price: priceInfo.unit_price,
            time: leadTime
          })
        }
        break
    }
  })

  return logisticsData
}

/**
 * 在应用启动时初始化物流数据
 * 可以在页面加载时调用此函数
 */
export async function initializeLogisticsData(): Promise<any> {
  try {
    console.log('正在从 Airtable 加载物流数据...')
    const data = await fetchLogisticsDataFromAirtable()
    console.log('物流数据加载成功:', data)
    return data
  } catch (error) {
    console.error('物流数据加载失败:', error)
    // 返回空数据结构，避免应用崩溃
    return {
      prices: { data: {} },
      sf: { regions: {} },
      shentong: { regions: {} },
      anneng: { tables: { anneng: [], anneng_timed: [] } }
    }
  }
}

/**
 * Airtable 表格结构示例
 * 
 * 字段建议：
 * 1. 物流公司 (Company) - 单行文本
 * 2. 地区 (Region) - 单行文本，格式：省份-城市
 * 3. 价格数据 (PriceData) - 长文本，JSON格式
 * 4. 时效 (LeadTime) - 单行文本
 * 5. 备注 (Notes) - 长文本
 * 
 * 价格数据 JSON 格式示例：
 * 
 * 新亮物流：
 * {
 *   "≤50kg": 120,
 *   "50-200kg": 2.5,
 *   "200-500kg": 2.2,
 *   "500-1000kg": 2.0,
 *   "1000-3000kg": 1.8,
 *   "≥3000kg": 1.6
 * }
 * 
 * 顺丰/申通：
 * {
 *   "first_kg": 15,
 *   "additional_per_kg": 8
 * }
 * 
 * 安能：
 * {
 *   "province": "江苏省",
 *   "cities": ["南京市", "苏州市"],
 *   "unit_price": 1.5
 * }
 */
