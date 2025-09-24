/**
 * 客户端数据加载器
 * 用于静态导出环境，直接调用 Airtable API 而不是通过 Next.js API 路由
 */

import { getPriceRules } from './loadPrices'
import { getLocations } from './loadLocations'

/**
 * 客户端加载价格数据
 * @returns Promise<any> 价格数据
 */
export async function loadPricesData(): Promise<any> {
  try {
    console.log('正在从客户端加载价格数据...')
    const data = await getPriceRules()
    return { success: true, data }
  } catch (error: any) {
    console.error('客户端价格数据加载失败:', error)
    return { 
      success: false, 
      error: error.message || '价格数据加载失败' 
    }
  }
}

/**
 * 客户端加载地点数据
 * @returns Promise<any> 地点数据
 */
export async function loadLocationsData(): Promise<any> {
  try {
    console.log('正在从客户端加载地点数据...')
    const data = await getLocations()
    return { success: true, data }
  } catch (error: any) {
    console.error('客户端地点数据加载失败:', error)
    return { 
      success: false, 
      error: error.message || '地点数据加载失败' 
    }
  }
}

/**
 * 并行加载所有数据
 * @returns Promise<{prices: any, locations: any}> 所有数据
 */
export async function loadAllData(): Promise<{
  prices: any
  locations: any
}> {
  try {
    console.log('正在并行加载所有数据...')
    const [pricesResult, locationsResult] = await Promise.all([
      loadPricesData(),
      loadLocationsData()
    ])

    return {
      prices: pricesResult,
      locations: locationsResult
    }
  } catch (error: any) {
    console.error('数据加载失败:', error)
    throw error
  }
}
