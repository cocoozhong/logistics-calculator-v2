'use client'

import React, { useState } from 'react'
import { calculatePrices } from '@/lib/price-calculator'
import { PriceResult, ParsedAddress, InputMode, CalculatorType } from '@/lib/types'
import AddressInput from '@/components/AddressInput'
import PriceResults from '@/components/PriceResults'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Truck, Calculator } from 'lucide-react'
import Link from 'next/link'

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

      {/* 导航栏 */}
      <div className="flex justify-center pt-4 md:pt-8 pb-2 md:pb-4">
        <div className="flex bg-white rounded-lg p-1 shadow-sm border w-full max-w-sm">
          <Link href="/" className="flex-1">
            <Button 
              variant="default" 
              className="flex items-center justify-center gap-1 md:gap-2 w-full text-xs md:text-sm"
            >
              <Truck className="h-3 w-3 md:h-4 md:w-4" />
              <span>物流计算器</span>
            </Button>
          </Link>
          <Link href="/profit" className="flex-1">
            <Button 
              variant="ghost" 
              className="flex items-center justify-center gap-1 md:gap-2 w-full text-xs md:text-sm"
            >
              <Calculator className="h-3 w-3 md:h-4 md:w-4" />
              <span>利润计算器</span>
            </Button>
          </Link>
        </div>
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
