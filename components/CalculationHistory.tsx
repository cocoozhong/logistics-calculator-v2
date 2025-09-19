'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Clock } from 'lucide-react'
import { getCalculationHistory, clearCalculationHistory, formatPrice } from '@/lib/profit-calculator'
import { CalculationRecord } from '@/lib/types'

interface CalculationHistoryProps {
  onRecordClick?: (record: CalculationRecord) => void
  type?: 'n-point' | 'profit-point'
}

export default function CalculationHistory({ onRecordClick, type }: CalculationHistoryProps) {
  const [history, setHistory] = useState<CalculationRecord[]>([])

  // 加载历史记录
  const loadHistory = () => {
    const records = getCalculationHistory()
    // 如果指定了类型，只显示该类型的记录
    const filteredRecords = type ? records.filter(record => record.type === type) : records
    setHistory(filteredRecords)
  }

  useEffect(() => {
    loadHistory()
  }, [])

  // 清空历史记录
  const handleClearHistory = () => {
    clearCalculationHistory()
    setHistory([])
  }

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 格式化记录显示
  const formatRecord = (record: CalculationRecord) => {
    if (record.type === 'n-point') {
      return `成本:${formatPrice(record.inputs.cost)} 利润点:${formatPrice(record.inputs.profitRate)}% 利润:${formatPrice(record.outputs.profit)} 售价:${formatPrice(record.outputs.price)}`
    } else {
      return `成本:${formatPrice(record.inputs.cost)} 售价:${formatPrice(record.inputs.price)} 利润点:${formatPrice(record.outputs.profitRate)}%`
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="text-sm">{type === 'n-point' ? 'N点售价历史' : type === 'profit-point' ? '赚几个点历史' : '计算历史'}</span>
          {history.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleClearHistory}
              className="h-6 text-xs"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              清空
            </Button>
          )}
        </CardTitle>
        <CardDescription className="text-xs">
          最近的计算记录，点击可快速填入
        </CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center text-gray-500 py-4 text-sm">
            暂无计算记录
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((record, index) => (
              <div
                key={record.id}
                className="p-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => onRecordClick?.(record)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      <Badge variant={record.type === 'n-point' ? 'default' : 'secondary'} className="text-xs">
                        #{index + 1}
                      </Badge>
                      <span className="text-xs text-gray-600">
                        {record.type === 'n-point' ? 'N点售价' : '赚几个点'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-800 break-words">
                      {formatRecord(record)}
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 flex-shrink-0">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{new Date(record.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
