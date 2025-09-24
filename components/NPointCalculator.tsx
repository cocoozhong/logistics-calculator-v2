'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Copy, Trash2 } from 'lucide-react'
import { calculateNPointPrice, formatPrice, copyToClipboard, saveCalculationRecord } from '@/lib/profit-calculator'
import { NPointInputs, NPointOutputs, CalculationRecord } from '@/lib/types'

interface NPointCalculatorProps {
  onHistoryUpdate?: () => void
}

const NPointCalculator = React.memo(function NPointCalculator({ onHistoryUpdate }: NPointCalculatorProps) {
  const [inputs, setInputs] = useState<NPointInputs>({
    cost: 0,
    profitRate: 0,
    taxRate: 0
  })
  
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null)
  
  const [outputs, setOutputs] = useState<NPointOutputs | null>(null)
  const [copySuccess, setCopySuccess] = useState<string | null>(null)
  const [lastSavedInputs, setLastSavedInputs] = useState<string>('')

  // 实时计算
  useEffect(() => {
    if (inputs.cost > 0 && inputs.profitRate > 0) {
      const result = calculateNPointPrice(inputs)
      setOutputs(result)
      
      // 自动保存（延迟3秒）
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout)
      }
      
      const timeout = setTimeout(() => {
        if (result) {
          // 检查是否已经保存过相同的输入
          const currentInputsKey = `${inputs.cost}-${inputs.profitRate}`
          if (currentInputsKey !== lastSavedInputs) {
            const record: CalculationRecord = {
              id: Date.now().toString(),
              type: 'n-point',
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
        profit: 0,
        price: 0,
        taxPrice: 0
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
  const handleInputChange = useCallback((field: keyof NPointInputs, value: string) => {
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
      profitRate: 0,
      taxRate: 0
    })
    setOutputs(null)
  }, [])


  return (
    <Card className="w-full">
      <CardHeader className="pb-3 md:pb-6">
        <CardTitle className="text-green-600 text-lg md:text-xl">N点售价</CardTitle>
        <CardDescription className="text-sm">
          根据产品成本、期望利润率计算售价
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4">
        {/* 输入区域 */}
        <div className="space-y-3 md:space-y-4">
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
            <Label htmlFor="profitRate" className="text-sm">利润点(%):</Label>
            <Input
              id="profitRate"
              type="number"
              step="0.01"
              value={inputs.profitRate || ''}
              onChange={(e) => handleInputChange('profitRate', e.target.value)}
              placeholder="请输入利润率"
              className="mt-1"
            />
          </div>
        </div>

        {/* 输出区域 - 一直显示 */}
        <div className="space-y-2 md:space-y-3 pt-3 md:pt-4 border-t">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium flex-1 truncate">利润: {outputs ? formatPrice(outputs.profit) : '0.00'} RMB</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopy(outputs ? formatPrice(outputs.profit) : '0.00', 'profit')}
              className="h-7 w-7 md:h-8 md:w-8 p-0 flex-shrink-0"
            >
              <Copy className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium flex-1 truncate">人民币售价: {outputs ? formatPrice(outputs.price) : '0.00'} RMB</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopy(outputs ? formatPrice(outputs.price) : '0.00', 'price')}
              className="h-7 w-7 md:h-8 md:w-8 p-0 flex-shrink-0"
            >
              <Copy className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
          
          {copySuccess && (
            <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
              已复制到剪贴板
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="pt-4">
          <Button onClick={handleClear} variant="outline" className="w-full">
            <Trash2 className="h-4 w-4 mr-2" />
            清空
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})

export default NPointCalculator
