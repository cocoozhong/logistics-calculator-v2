'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Truck, Calculator } from 'lucide-react'
import Link from 'next/link'
import NPointCalculator from '@/components/NPointCalculator'
import ProfitPointCalculator from '@/components/ProfitPointCalculator'
import CalculationHistory from '@/components/CalculationHistory'
import { CalculationRecord } from '@/lib/types'

export default function ProfitCalculatorPage() {
  const [historyKey, setHistoryKey] = useState(0)

  // 处理历史记录更新
  const handleHistoryUpdate = () => {
    setHistoryKey(prev => prev + 1)
  }

  // 处理历史记录点击
  const handleRecordClick = (record: CalculationRecord) => {
    // 这里可以实现点击历史记录快速填入的功能
    console.log('点击历史记录:', record)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="container mx-auto px-3 md:px-4 max-w-7xl">
        {/* 导航栏 */}
        <div className="flex justify-center mb-6 md:mb-8">
          <div className="flex bg-white rounded-lg p-1 shadow-sm border w-full max-w-sm">
            <Link href="/" className="flex-1">
              <Button 
                variant="ghost" 
                className="flex items-center justify-center gap-1 md:gap-2 w-full text-xs md:text-sm"
              >
                <Truck className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">物流计算器</span>
                <span className="sm:hidden">物流</span>
              </Button>
            </Link>
            <Link href="/profit" className="flex-1">
              <Button 
                variant="default" 
                className="flex items-center justify-center gap-1 md:gap-2 w-full text-xs md:text-sm"
              >
                <Calculator className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">利润计算器</span>
                <span className="sm:hidden">利润</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* 页面标题 */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">利润计算器</h1>
          <p className="text-sm md:text-base text-gray-600">智能计算产品利润和定价</p>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          {/* 左侧：N点售价计算 */}
          <div className="space-y-4 md:space-y-6">
            <NPointCalculator onHistoryUpdate={handleHistoryUpdate} />
            <CalculationHistory 
              key={historyKey}
              onRecordClick={handleRecordClick}
              type="n-point"
            />
          </div>

          {/* 右侧：赚几个点计算 */}
          <div className="space-y-4 md:space-y-6">
            <ProfitPointCalculator onHistoryUpdate={handleHistoryUpdate} />
            <CalculationHistory 
              key={historyKey}
              onRecordClick={handleRecordClick}
              type="profit-point"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
