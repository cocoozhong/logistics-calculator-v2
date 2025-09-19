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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* 导航栏 */}
        <div className="flex justify-center pt-3 md:pt-4 pb-2">
          <div className="flex bg-white rounded-lg p-1 shadow-sm border w-full max-w-sm">
            <Button 
              asChild
              variant="ghost" 
              className="flex-1 flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm"
            >
              <Link href="/">
                <Truck className="h-3 w-3 md:h-4 md:w-4" />
                <span>物流计算器</span>
              </Link>
            </Button>
            <Button 
              asChild
              variant="default" 
              className="flex-1 flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm"
            >
              <Link href="/profit">
                <Calculator className="h-3 w-3 md:h-4 md:w-4" />
                <span>利润计算器</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* 顶部站点名 */}
        <div className="text-center mb-3 md:mb-4">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-blue-600">伟吉线槽计算工具</h1>
        </div>

        {/* 主要内容 */}
        <main className="container mx-auto px-3 md:px-4 py-2">
          <div className="max-w-5xl mx-auto space-y-3 md:space-y-4">
            {/* 主要内容区域 */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 md:gap-4">
              {/* 左侧：N点售价计算 */}
              <div className="space-y-3 md:space-y-4">
                <NPointCalculator onHistoryUpdate={handleHistoryUpdate} />
                <CalculationHistory 
                  key={historyKey}
                  onRecordClick={handleRecordClick}
                  type="n-point"
                />
              </div>

              {/* 右侧：赚几个点计算 */}
              <div className="space-y-3 md:space-y-4">
                <ProfitPointCalculator onHistoryUpdate={handleHistoryUpdate} />
                <CalculationHistory 
                  key={historyKey}
                  onRecordClick={handleRecordClick}
                  type="profit-point"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
