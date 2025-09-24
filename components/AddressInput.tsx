'use client'

import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { parseAddress, validateAddress, formatAddress } from '@/lib/address-parser'
import { ParsedAddress, InputMode } from '@/lib/types'
import { Location } from '@/lib/loadLocations'
import { matchLocation, parseAddressWithLocations } from '@/lib/location-matcher'
import { Search, MapPin, User, Phone, CheckCircle, AlertCircle, X } from 'lucide-react'


interface AddressInputProps {
  onAddressChange: (province: string, city: string, parsedInfo?: ParsedAddress) => void
  onWeightChange: (weight: number) => void
  weight: number
  onClearAll?: () => void
  onModeChange?: (mode: InputMode) => void
  disabled?: boolean
  locations: Location[]
  onTextAddressInput?: (textInput: string) => void
  province?: string
  city?: string
}

export default function AddressInput({ onAddressChange, onWeightChange, weight, onClearAll, onModeChange, disabled = false, locations, onTextAddressInput, province, city }: AddressInputProps) {
  const [mode, setMode] = useState<InputMode>('text')
  const [textInput, setTextInput] = useState('')
  const [parsedAddress, setParsedAddress] = useState<ParsedAddress | null>(null)
  const [isValid, setIsValid] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  // 本地受控的重量输入字符串，避免被父级状态回写造成闪烁
  const [weightInput, setWeightInput] = useState('')

  // 处理文字输入模式
  const handleTextInput = (value: string) => {
    setTextInput(value)
    if (onTextAddressInput) {
      onTextAddressInput(value)
    }
  }

  // 处理地点选择
  const handleLocationSelect = (locationName: string) => {
    onAddressChange(locationName, locationName, undefined)
  }

  // 处理搜索
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      // 使用地点数据进行搜索
      const results = locations.filter(location => 
        location.name.toLowerCase().includes(query.toLowerCase())
      ).map(location => ({
        province: location.name,
        city: location.name,
        name: location.name
      }))
      setSearchResults(results)
      setShowSearchResults(true)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }

  const handleSearchSelect = (result: any) => {
    onAddressChange(result.name, result.name, undefined)
    setSearchQuery('')
    setShowSearchResults(false)
  }

  // 处理地点组合选择
  const handleLocationChange = (value: string) => {
    if (value) {
      onAddressChange(value, value, undefined)
    } else {
      onAddressChange('', '', undefined)
    }
  }

  // 处理融合输入选择
  const handleInputChange = (value: string) => {
    setInputValue(value)
    setShowDropdown(true)
    
    if (value.trim()) {
      // 使用传入的locations数据进行搜索，只搜索有计价规则的地点
      const filteredLocations = locations.filter(location => 
        location.pricingRules && location.pricingRules.length > 0 &&
        location.name.toLowerCase().includes(value.toLowerCase())
      )
      setSearchResults(filteredLocations.map(loc => ({ name: loc.name })))
    } else {
      setSearchResults([])
      setShowDropdown(false)
      onAddressChange('', '', undefined)
    }
  }

  // 选择选项
  const handleOptionSelect = (option: any) => {
    setInputValue(option.name)
    setShowDropdown(false)
    setSearchResults([])
    onAddressChange(option.name, option.name, undefined)
  }

  // 处理输入框焦点
  const handleInputFocus = () => {
    if (inputValue.trim()) {
      setShowDropdown(true)
    } else {
      // 如果没有输入内容，显示所有有计价规则的地点
      const locationsWithRules = locations.filter(loc => loc.pricingRules && loc.pricingRules.length > 0)
      setSearchResults(locationsWithRules.map(loc => ({ name: loc.name })))
      setShowDropdown(true)
    }
  }

  // 处理输入框失焦
  const handleInputBlur = () => {
    // 延迟隐藏下拉框，让点击事件先执行
    setTimeout(() => {
      setShowDropdown(false)
    }, 200)
  }

  // 处理重量变化
  const handleWeightChange = (value: string) => {
    setWeightInput(value)
    if (value === '') {
      // 允许清空
      onWeightChange(0)
    } else {
      const numValue = parseFloat(value)
      if (!isNaN(numValue) && numValue > 0) {
        onWeightChange(numValue)
      }
    }
  }

  // 一键清除重量
  const clearWeight = () => {
    onWeightChange(0)
    setWeightInput('')
  }

  // 清除所有输入
  const clearAll = () => {
    setTextInput('')
    setInputValue('')
    setShowDropdown(false)
    setParsedAddress(null)
    setIsValid(false)
    setSearchResults([])
    setShowSearchResults(false)
    setSearchQuery('')
    onWeightChange(0)
    setWeightInput('')
    onAddressChange('', '', undefined)
    if (onClearAll) {
      onClearAll()
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={mode} onValueChange={(value) => {
        setMode(value as InputMode)
        // 切换模式时清除所有内容
        setTextInput('')
        setInputValue('')
        setShowDropdown(false)
        setParsedAddress(null)
        setIsValid(false)
        setSearchResults([])
        setShowSearchResults(false)
        setSearchQuery('')
        onAddressChange('', '', undefined)
        onWeightChange(0) // 清空重量
        if (onModeChange) {
          onModeChange(value as InputMode)
        }
      }} className="w-full">
        {/* 文字输入模式 */}
        <TabsContent value="text" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">地址输入</CardTitle>
                  <CardDescription>
                    请输入地址，越详尽越好
                  </CardDescription>
                </div>
                {/* 输入模式切换按钮 */}
                <TabsList className={`grid grid-cols-2 h-7 text-xs ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
                  <TabsTrigger value="text" className="flex items-center gap-1 px-2" disabled={disabled}>
                    <Search className="h-3 w-3" />
                    文字
                  </TabsTrigger>
                  <TabsTrigger value="select" className="flex items-center gap-1 px-2" disabled={disabled}>
                    <MapPin className="h-3 w-3" />
                    选择
                  </TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Textarea
                  placeholder="请输入地址，越详尽越好"
                  value={textInput}
                  onChange={(e) => handleTextInput(e.target.value)}
                  className="min-h-[80px] resize-none"
                  disabled={disabled}
                />
              </div>
              
              {/* 地址解析结果显示 */}
              {(province || city) && (
                <div className="text-xs text-gray-500 text-center">
                  {province && city && province === city ? (
                    <span>解析结果：{province}</span>
                  ) : (
                    <span>解析结果：{province && `省份：${province}`}{province && city && '，'}{city && `城市：${city}`}</span>
                  )}
                </div>
              )}
              
              {parsedAddress && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {isValid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm font-medium">
                      {isValid ? '地址解析成功' : '地址解析不完整'}
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md text-sm space-y-1">
                    {parsedAddress.name && (
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-gray-500" />
                        <span>姓名：{parsedAddress.name}</span>
                      </div>
                    )}
                    {parsedAddress.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-gray-500" />
                        <span>电话：{parsedAddress.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-gray-500" />
                      <span>地址：{parsedAddress.province} {parsedAddress.city}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 选择模式 */}
        <TabsContent value="select" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">精确地址选择</CardTitle>
                  <CardDescription>
                    输入或选择省份和城市，支持智能搜索
                  </CardDescription>
                </div>
                {/* 输入模式切换按钮 */}
                <TabsList className={`grid grid-cols-2 h-7 text-xs ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
                  <TabsTrigger value="text" className="flex items-center gap-1 px-2" disabled={disabled}>
                    <Search className="h-3 w-3" />
                    文字
                  </TabsTrigger>
                  <TabsTrigger value="select" className="flex items-center gap-1 px-2" disabled={disabled}>
                    <MapPin className="h-3 w-3" />
                    选择
                  </TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 融合输入选择框 */}
              <div className="relative">
                <label className="block text-sm font-medium mb-1">选择地址</label>
                <div className="relative">
                  <Input
                    placeholder="搜索或选择地点..."
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  
                  {/* 下拉选项 */}
                  {showDropdown && searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto">
                      <div className="p-2 text-xs text-gray-500 border-b border-gray-100">
                        找到 {searchResults.length} 个结果
                      </div>
                      {searchResults.map((result, index) => (
                        <button
                          key={index}
                          onClick={() => handleOptionSelect(result)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-50"
                        >
                          <div className="font-medium">{result.name}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 重量输入 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">货物重量</CardTitle>
              <CardDescription>请输入货物的重量（公斤）</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              一键清除
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                type="number"
                placeholder="请输入重量"
                value={weightInput}
                onChange={(e) => handleWeightChange(e.target.value)}
                onWheel={(e) => e.currentTarget.blur()}
                className="pr-10"
                min="0.01"
                step="0.1"
                disabled={disabled}
              />
              {weight > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearWeight}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                >
                  <X className="h-3 w-3 text-gray-500" />
                </Button>
              )}
            </div>
            <span className="text-sm text-gray-500">kg</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
