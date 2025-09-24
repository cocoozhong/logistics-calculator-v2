'use client'

import React, { useState, useEffect } from 'react'
// 移除直接导入，改为使用 API 路由
import { calculatePrice } from '@/lib/price-calculator'
import { PriceResult, ParsedAddress, InputMode, CalculatorType } from '@/lib/types'
import { PriceRule } from '@/types/pricing'
import { Location } from '@/lib/loadLocations'
import { matchLocation, parseAddressWithLocations } from '@/lib/location-matcher'
import { loadAllData } from '@/lib/client-data-loader'
import AddressInput from '@/components/AddressInput'
import PriceResults from '@/components/PriceResults'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Truck, Calculator, Loader2 } from 'lucide-react'
import Link from 'next/link'

// Fresh deployment to new repository - logistics-calculator-v2 - Clean deployment
export default function HomePage() {
  const [province, setProvince] = useState('')
  const [city, setCity] = useState('')
  const [weight, setWeight] = useState(0)
  const [parsedInfo, setParsedInfo] = useState<ParsedAddress | null>(null)
  const [results, setResults] = useState<PriceResult[]>([])
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [currentMode, setCurrentMode] = useState<InputMode>('text')
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [dataLoadError, setDataLoadError] = useState<string | null>(null)
  const [priceRules, setPriceRules] = useState<PriceRule[]>([])
  const [locations, setLocations] = useState<Location[]>([])

  // 根据价格规则计算价格 - 智能匹配逻辑
  const calculatePricesFromRules = (candidateLocations: Location[], weight: number, rules: PriceRule[]): PriceResult[] => {
    const results: PriceResult[] = []
    
    // 按优先级遍历候选地点：先尝试最精确的，再尝试省份级别的
    for (const candidateLocation of candidateLocations) {
      const locationName = candidateLocation.name;
      
      // 查找适用于当前地点的价格规则
      const applicableRules = rules.filter(rule => {
        if (!rule.RuleName) return false;
        
        const ruleName = rule.RuleName.toLowerCase();
        
        // 直接检查规则名称中是否包含目标地区
        if (ruleName.includes(locationName.toLowerCase())) {
          return true;
        }
        
        // 支持复合规则匹配 - 解析规则名称中的目的地列表
        const destinationsPart = ruleName.split('-').pop(); // 获取最后一部分
        if (destinationsPart) {
          const destinations = destinationsPart.split(',').map(d => d.trim());
          
          // 检查每个目的地是否匹配
          for (const destination of destinations) {
            if (destination.includes(locationName.toLowerCase())) {
              return true;
            }
          }
        }
        
        return false;
      });
      
      // 如果找到了适用的规则，计算价格并返回结果
      if (applicableRules.length > 0) {
        console.log(`为地点 ${locationName} 找到 ${applicableRules.length} 条价格规则`);
        
        applicableRules.forEach(rule => {
          try {
            const price = calculatePrice(weight, rule)
            if (price > 0) {
              // 构建更详细的备注信息
              let note = `规则: ${rule.RuleName || '未命名规则'}`
              if (rule.Destination) {
                note += ` | 目的地: ${rule.Destination}`
              }
              if (rule.ModelType) {
                note += ` | 模型: ${rule.ModelType}`
              }
              note += ` | 匹配地点: ${locationName}`

              // 正确处理公司名称（可能是数组或字符串）
              let companyName = '未知物流公司'
              if (Array.isArray(rule.CompanyName)) {
                companyName = rule.CompanyName[0] || '未知物流公司'
              } else if (typeof rule.CompanyName === 'string') {
                companyName = rule.CompanyName
              } else if (Array.isArray(rule.Company)) {
                companyName = rule.Company[0] || '未知物流公司'
              } else if (rule.RuleName) {
                companyName = rule.RuleName
              }

              results.push({
                company: companyName,
                price: price,
                currency: 'CNY',
                leadTime: rule.Timeliness || '',
                isCheapest: false,
                note: note
              })
            }
          } catch (error) {
            console.error('计算价格失败:', error, rule)
          }
        })
        
        // 找到规则后立即返回，不再尝试其他候选地点
        break;
      } else {
        console.log(`地点 ${locationName} 没有找到适用的价格规则，尝试下一个候选地点`);
      }
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

  // 初始化物流数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true)
        setDataLoadError(null)

        // 使用客户端数据加载器
        const { prices, locations } = await loadAllData()

        if (!prices.success) {
          throw new Error(prices.error || '价格数据加载失败')
        }

        if (!locations.success) {
          throw new Error(locations.error || '地点数据加载失败')
        }

        setPriceRules(prices.data)
        setLocations(locations.data)
        console.log('数据初始化成功', prices.data.length, '条价格规则', locations.data.length, '个地点')
      } catch (error) {
        console.error('数据初始化失败:', error)
        setDataLoadError('数据加载失败，请检查网络连接或联系管理员')
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [])

  // 处理地址变化
  const handleAddressChange = (newProvince: string, newCity: string, parsed?: ParsedAddress) => {
    setProvince(newProvince)
    setCity(newCity)
    setParsedInfo(parsed || null)
    setHasError(false)
    setErrorMessage('')

    // 如果有地址和重量，重新计算价格
    if ((newProvince || newCity) && weight > 0 && priceRules.length > 0 && locations.length > 0) {
      // 重新解析地址获取候选地点
      const addressText = `${newProvince} ${newCity}`.trim()
      const { candidateLocations } = parseAddressWithLocations(addressText, locations)
      
      if (candidateLocations.length > 0) {
        const priceResults = calculatePricesFromRules(candidateLocations, weight, priceRules)
        setResults(priceResults)
      } else {
        setResults([])
      }
    } else if ((newProvince || newCity) && weight === 0) {
      setResults([])
    } else if (!newProvince && !newCity) {
      setResults([])
    }
  }

  // 处理文字输入模式的地址解析
  const handleTextAddressInput = (textInput: string) => {
    if (!textInput.trim() || locations.length === 0) {
      setProvince('')
      setCity('')
      setResults([])
      return
    }

    // 使用地区匹配功能解析地址
    const { province: matchedProvince, city: matchedCity, matchedLocation, candidateLocations } = parseAddressWithLocations(textInput, locations)
    
    if (matchedLocation && candidateLocations.length > 0) {
      setProvince(matchedLocation.name)
      setCity(matchedLocation.name)
      setHasError(false) // 清除错误状态
      setErrorMessage('')
      
      // 如果有重量，立即计算价格
      if (weight > 0 && priceRules.length > 0) {
        const priceResults = calculatePricesFromRules(candidateLocations, weight, priceRules)
        setResults(priceResults)
      }
    } else {
      setProvince('')
      setCity('')
      setResults([])
      setHasError(true)
      setErrorMessage('未找到匹配的地区，请检查输入或选择其他地区')
    }
  }

  // 处理重量变化
  const handleWeightChange = (newWeight: number) => {
    setWeight(newWeight)
    setHasError(false)
    setErrorMessage('')

    // 如果有地址和重量，重新计算价格
    if ((province || city) && newWeight > 0 && priceRules.length > 0 && locations.length > 0) {
      // 重新解析地址获取候选地点
      const addressText = `${province} ${city}`.trim()
      const { candidateLocations } = parseAddressWithLocations(addressText, locations)
      
      if (candidateLocations.length > 0) {
        const priceResults = calculatePricesFromRules(candidateLocations, newWeight, priceRules)
        setResults(priceResults)
      } else {
        setResults([])
      }
    } else {
      setResults([])
    }
  }

  // 处理模式变化
  const handleModeChange = (mode: InputMode) => {
    setCurrentMode(mode)
    setHasError(false)
    setErrorMessage('')
  }

  // 清除所有输入
  const handleClearAll = () => {
    setProvince('')
    setCity('')
    setWeight(0)
    setParsedInfo(null)
    setResults([])
    setHasError(false)
    setErrorMessage('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 顶部导航 */}
      <div className="flex justify-center pt-3 md:pt-4 pb-2">
        <div className="flex bg-white rounded-lg p-1 shadow-sm border w-full max-w-sm">
          <Link 
            href="/"
            className="flex-1 flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium transition-colors"
          >
            <Truck className="h-3 w-3 md:h-4 md:w-4" />
            <span>物流计算器</span>
          </Link>
          <Link 
            href="/profit"
            className="flex-1 flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md font-medium transition-colors"
          >
            <Calculator className="h-3 w-3 md:h-4 md:w-4" />
            <span>利润计算器</span>
          </Link>
        </div>
      </div>

      {/* 顶部站点名 */}
      <div className="text-center mb-3 md:mb-4">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-blue-600">源星辅料计算工具</h1>
      </div>

      {/* 主要内容 */}
      <main className="container mx-auto px-3 md:px-4 py-2">
        <div className="max-w-5xl mx-auto space-y-3 md:space-y-4">
          {/* 数据加载状态 */}
          {isLoadingData && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="flex items-center justify-center gap-2 py-4">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-blue-600 font-medium">正在加载物流数据...</span>
              </CardContent>
            </Card>
          )}

          {/* 数据加载错误 */}
          {dataLoadError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="py-4">
                <div className="text-red-600 text-center">
                  <p className="font-medium mb-2">⚠️ 数据加载失败</p>
                  <p className="text-sm">{dataLoadError}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm transition-colors"
                  >
                    重新加载
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 输入表单 */}
          <AddressInput
            onAddressChange={handleAddressChange}
            onWeightChange={handleWeightChange}
            weight={weight}
            onClearAll={handleClearAll}
            locations={locations}
            onTextAddressInput={handleTextAddressInput}
            onModeChange={handleModeChange}
            disabled={isLoadingData}
            province={province}
            city={city}
          />


          {/* 价格结果 */}
          <PriceResults
            results={results}
            weight={weight}
            province={province}
            city={city}
            hasError={hasError}
            errorMessage={errorMessage}
          />
        </div>
      </main>
    </div>
  )
}
