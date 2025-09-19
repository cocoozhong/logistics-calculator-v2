'use client'

import React, { useState } from 'react'
import { calculatePrices } from '@/lib/price-calculator'
import { PriceResult, ParsedAddress, InputMode, CalculatorType } from '@/lib/types'
import AddressInput from '@/components/AddressInput'
import PriceResults from '@/components/PriceResults'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Truck, Calculator } from 'lucide-react'
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
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-blue-600">伟吉线槽计算工具</h1>
      </div>

      {/* 主要内容 */}
      <main className="container mx-auto px-3 md:px-4 py-2">
        <div className="max-w-5xl mx-auto space-y-3 md:space-y-4">
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
