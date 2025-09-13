'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PriceResult } from '@/lib/types'
import { formatPrice } from '@/lib/price-calculator'
import { Truck, Clock, Star, Copy, Check } from 'lucide-react'

interface PriceResultsProps {
  results: PriceResult[]
  weight: number
  province: string
  city: string
  hasError?: boolean
  errorMessage?: string
}

export default function PriceResults({ results, weight, province, city, hasError, errorMessage }: PriceResultsProps) {
  // 复制功能状态
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  // 复制到剪贴板
  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 三家公司的基础信息
  const companies = [
    { name: '新亮物流', key: 'xinliang' },
    { name: '申通快递', key: 'shentong' },
    { name: '顺丰快递', key: 'sf' }
  ]

  // 获取对应公司的价格结果
  const getCompanyResult = (companyName: string) => {
    return results.find(r => r.company === companyName)
  }

  // 获取最便宜的结果
  const cheapestResult = results.find(r => r.isCheapest)

  return (
    <div className="space-y-6">
      {/* 错误提示 */}
      {hasError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <span className="font-medium">地址解析失败</span>
              <span className="text-sm">{errorMessage}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 结果摘要 */}
      {cheapestResult && !hasError && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-700">
              <Star className="h-4 w-4" />
              <span className="font-medium">最优惠：{cheapestResult.company}</span>
              <span className="text-lg font-bold">{formatPrice(cheapestResult.price)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 三家公司价格卡片 */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        {companies.map((company, index) => {
          const result = getCompanyResult(company.name)
          const isCheapest = result?.isCheapest
          const hasResult = !!result
          
          return (
            <Card
              key={company.key}
              className={`relative transition-all duration-300 hover:shadow-lg ${
                isCheapest
                  ? 'border-green-500 bg-green-50 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-gray-300'
              } ${!hasResult ? 'opacity-50' : ''}`}
            >
              {isCheapest && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  最便宜
                </div>
              )}
              
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  {company.name}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="text-center">
                  {hasResult ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className={`text-3xl font-bold ${
                        isCheapest ? 'text-green-600' : 'text-gray-900'
                      }`}>
                        {formatPrice(result.price)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(formatPrice(result.price), index)}
                        className="h-8 w-8 p-0"
                      >
                        {copiedIndex === index ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-gray-400">
                      --
                    </div>
                  )}
                  <div className="text-sm text-gray-500">CNY</div>
                </div>
                
                {hasResult && result.leadTime && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>配送时效：{result.leadTime}</span>
                  </div>
                )}
                
                {hasResult && weight > 0 && (
                  <div className="text-xs text-gray-500">
                    单价：{formatPrice(result.price / weight)}/kg
                  </div>
                )}
                
                {hasResult && result.note && (
                  <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded mt-2">
                    {result.note}
                  </div>
                )}
                
                {!hasResult && (
                  <div className="text-sm text-gray-400 text-center">
                    请先输入地址和重量
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}