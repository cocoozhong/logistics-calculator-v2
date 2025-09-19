'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Copy, Trash2 } from 'lucide-react'
import { calculateProfitPoint, formatPrice, copyToClipboard, saveCalculationRecord } from '@/lib/profit-calculator'
import { ProfitPointInputs, ProfitPointOutputs, CalculationRecord } from '@/lib/types'

interface ProfitPointCalculatorProps {
  onHistoryUpdate?: () => void
}

const ProfitPointCalculator = React.memo(function ProfitPointCalculator({ onHistoryUpdate }: ProfitPointCalculatorProps) {
  const [inputs, setInputs] = useState<ProfitPointInputs>({
    cost: 0,
    price: 0
  })
  
  const [outputs, setOutputs] = useState<ProfitPointOutputs | null>(null)
  const [copySuccess, setCopySuccess] = useState<string | null>(null)
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null)
  const [lastSavedInputs, setLastSavedInputs] = useState<string>('')

  // 实时计算
  useEffect(() => {
    if (inputs.cost > 0 && inputs.price > 0) {
      const result = calculateProfitPoint(inputs)
      setOutputs(result)
      
      // 自动保存（延迟3秒）
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout)
      }
      
      const timeout = setTimeout(() => {
        if (result) {
          // 检查是否已经保存过相同的输入
          const currentInputsKey = `${inputs.cost}-${inputs.price}`
          if (currentInputsKey !== lastSavedInputs) {
            const record: CalculationRecord = {
              id: Date.now().toString(),
              type: 'profit-point',
              inputs: { ...inputs },
              outputs: { ...result },
              timestamp: Date.now()
            }
            saveCalculationRecord(record)
            setLastSavedInputs(currentInputsKey)
            onHistoryUpdate?.()
          }
        }
      }, 3000)
      
      setAutoSaveTimeout(timeout)
    } else {
      // 即使没有输入，也显示默认结果
      setOutputs({
        profitRate: 0
      })
    }
    
    // 清理定时器
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout)
      }
    }
  }, [inputs, onHistoryUpdate])

  // 处理输入变化
  const handleInputChange = useCallback((field: keyof ProfitPointInputs, value: string) => {
    const numValue = parseFloat(value) || 0
    setInputs(prev => ({
      ...prev,
      [field]: numValue
    }))
  }, [])

  // 复制功能
  const handleCopy = useCallback(async (text: string, type: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopySuccess(type)
      setTimeout(() => setCopySuccess(null), 2000)
    }
  }, [])

  // 清空功能
  const handleClear = useCallback(() => {
    setInputs({
      cost: 0,
      price: 0
    })
    setOutputs(null)
  }, [])


  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-green-600 text-lg">赚几个点</CardTitle>
        <CardDescription className="text-sm">
          根据成本和售价反推利润率
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 输入区域 */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="cost" className="text-sm">产品人民币成本:</Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              value={inputs.cost || ''}
              onChange={(e) => handleInputChange('cost', e.target.value)}
              placeholder="请输入成本"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="price" className="text-sm">产品人民币售价:</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={inputs.price || ''}
              onChange={(e) => handleInputChange('price', e.target.value)}
              placeholder="请输入售价"
              className="mt-1"
            />
          </div>
        </div>

        {/* 输出区域 - 一直显示 */}
        <div className="space-y-2 pt-3 border-t">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium flex-1 truncate">利润点: {outputs ? formatPrice(outputs.profitRate) : '0.00'}%</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopy(outputs ? formatPrice(outputs.profitRate) + '%' : '0.00%', 'profitRate')}
              className="h-6 w-6 p-0 flex-shrink-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          
          {copySuccess && (
            <div className="text-xs text-green-600 bg-green-50 p-1 rounded">
              已复制到剪贴板
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="pt-3">
          <Button onClick={handleClear} variant="outline" className="w-full h-8 text-sm">
            <Trash2 className="h-3 w-3 mr-1" />
            清空
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})

export default ProfitPointCalculator
