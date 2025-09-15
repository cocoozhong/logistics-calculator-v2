'use client'

import React, { useState } from 'react'
import { calculatePrices } from '@/lib/price-calculator'
import { PriceResult, ParsedAddress, InputMode, CalculatorType } from '@/lib/types'
import AddressInput from '@/components/AddressInput'
import PriceResults from '@/components/PriceResults'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Truck, Calculator } from 'lucide-react'
import Link from 'next/link'

// Force redeploy to fix UI display - Clear GitHub Pages cache completely
export default function HomePage() {
  const [province, setProvince] = useState('')
  const [city, setCity] = useState('')
  const [weight, setWeight] = useState(0)
  const [parsedInfo, setParsedInfo] = useState<ParsedAddress | null>(null)
  const [results, setResults] = useState<PriceResult[]>([])
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [currentMode, setCurrentMode] = useState<InputMode>('text')

  // 处理地址变化
  const handleAddressChange = (newProvince: string, newCity: string, parsed?: ParsedAddress) => {
    setProvince(newProvince)
    setCity(newCity)
    setParsedInfo(parsed || null)
    setHasError(false)
    setErrorMessage('')
    
    // 智能解析：有省份和重量就可以计算，系统会根据数据颗粒度自动处理
    if (newProvince && weight > 0) {
      const priceResults = calculatePrices(newProvince, newCity, weight)
      setResults(priceResults)
    } else if (newProvince && weight === 0) {
      setResults([])
    } else if (!newProvince) {
      setResults([])
    }
  }

  // 处理重量变化
  const handleWeightChange = (newWeight: number) => {
    setWeight(newWeight)
    setHasError(false)
    setErrorMessage('')
    
    // 智能解析：有省份和重量就可以计算，系统会根据数据颗粒度自动处理
    if (province && newWeight > 0) {
      const priceResults = calculatePrices(province, city, newWeight)
      setResults(priceResults)
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
      {/* 导航栏 - 简化结构避免静态生成问题 */}
      <div className="flex justify-center pt-4 md:pt-8 pb-2 md:pb-4">
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

      {/* 页面标题 - 直接硬编码确保部署时显示 */}
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">智能物流费用计算工具</h1>
        <p className="text-sm md:text-base text-gray-600">多物流公司价格对比，智能地址解析，移动端优化</p>
      </div>

      {/* 主要内容 */}
      <main className="container mx-auto px-3 md:px-4 py-2 md:py-4">
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-8">
          {/* 输入表单 */}
          <AddressInput
            onAddressChange={handleAddressChange}
            onWeightChange={handleWeightChange}
            weight={weight}
            onClearAll={handleClearAll}
            onModeChange={handleModeChange}
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
