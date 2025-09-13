'use client'

import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { parseAddress, validateAddress, formatAddress } from '@/lib/address-parser'
import { getAllProvinces, getCitiesByProvince, searchProvinceCity, getAllProvinceCityOptions } from '@/lib/province-city-data'
import { ParsedAddress, InputMode } from '@/lib/types'
import { Search, MapPin, User, Phone, CheckCircle, AlertCircle, X } from 'lucide-react'

// 从输入中解析省份和城市
function parseProvinceCityFromInput(input: string): { province: string; city: string } {
  const provinces = [
    '北京市', '天津市', '河北省', '山西省', '内蒙古', '辽宁省', '吉林省', '黑龙江省',
    '上海市', '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省', '河南省',
    '湖北省', '湖南省', '广东省', '广西', '海南省', '重庆市', '四川省', '贵州省',
    '云南省', '西藏', '陕西省', '甘肃省', '青海省', '宁夏', '新疆'
  ]
  
  let province = ''
  let city = ''
  
  // 查找省份
  for (const prov of provinces) {
    if (input.includes(prov)) {
      province = prov
      break
    }
  }
  
  // 如果找到省份，尝试提取城市
  if (province) {
    const afterProvince = input.substring(input.indexOf(province) + province.length).trim()
    const words = afterProvince.split(/[\s，,]/).filter(word => word.length > 0)
    
    if (words.length > 0) {
      const firstWord = words[0]
      // 如果包含城市关键词，直接使用
      if (firstWord.includes('市') || firstWord.includes('县') || firstWord.includes('区')) {
        city = firstWord
      } else if (firstWord.length >= 2 && firstWord.length <= 6) {
        // 尝试添加"市"后缀
        city = firstWord + '市'
      }
    }
  }
  
  return { province, city }
}

interface AddressInputProps {
  onAddressChange: (province: string, city: string, parsedInfo?: ParsedAddress) => void
  onWeightChange: (weight: number) => void
  weight: number
  onClearAll?: () => void
  onModeChange?: (mode: InputMode) => void
}

export default function AddressInput({ onAddressChange, onWeightChange, weight, onClearAll, onModeChange }: AddressInputProps) {
  const [mode, setMode] = useState<InputMode>('text')
  const [textInput, setTextInput] = useState('')
  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedProvinceCity, setSelectedProvinceCity] = useState('')
  const [parsedAddress, setParsedAddress] = useState<ParsedAddress | null>(null)
  const [isValid, setIsValid] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  // 处理文字输入模式
  const handleTextInput = (value: string) => {
    setTextInput(value)
    if (value.trim()) {
      const parsed = parseAddress(value)
      setParsedAddress(parsed)
      // 智能解析：只要有省份就认为可以计算（城市可以为空）
      const valid = !!(parsed.province)
      setIsValid(valid)
      
      if (valid) {
        onAddressChange(parsed.province, parsed.city, parsed)
      }
    } else {
      setParsedAddress(null)
      setIsValid(false)
    }
  }

  // 处理选择模式
  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province)
    setSelectedCity('')
    if (province) {
      onAddressChange(province, '', undefined)
    }
  }

  const handleCityChange = (city: string) => {
    setSelectedCity(city)
    if (selectedProvince && city) {
      onAddressChange(selectedProvince, city, undefined)
    }
  }

  // 处理搜索
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const results = searchProvinceCity(query)
      setSearchResults(results)
      setShowSearchResults(true)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }

  const handleSearchSelect = (result: any) => {
    if (result.city) {
      setSelectedProvince(result.province)
      setSelectedCity(result.city)
      setSelectedProvinceCity(`${result.province} ${result.city}`)
      onAddressChange(result.province, result.city, undefined)
    } else {
      setSelectedProvince(result.province)
      setSelectedCity('')
      setSelectedProvinceCity(result.province)
      onAddressChange(result.province, '', undefined)
    }
    setSearchQuery('')
    setShowSearchResults(false)
  }

  // 处理省份+城市组合选择
  const handleProvinceCityChange = (value: string) => {
    setSelectedProvinceCity(value)
    if (value) {
      const [province, city] = value.split(' ')
      setSelectedProvince(province)
      setSelectedCity(city || '')
      onAddressChange(province, city || '', undefined)
    } else {
      setSelectedProvince('')
      setSelectedCity('')
      onAddressChange('', '', undefined)
    }
  }

  // 处理融合输入选择
  const handleInputChange = (value: string) => {
    setInputValue(value)
    setShowDropdown(true)
    
    if (value.trim()) {
      // 搜索匹配的选项
      const allOptions = getAllProvinceCityOptions()
      const filteredOptions = allOptions.filter(option => 
        option.fullName.toLowerCase().includes(value.toLowerCase()) ||
        option.province.toLowerCase().includes(value.toLowerCase()) ||
        option.city.toLowerCase().includes(value.toLowerCase())
      )
      setSearchResults(filteredOptions) // 显示所有匹配结果
      
      // 智能解析：尝试从输入中提取省份和城市
      const { province, city } = parseProvinceCityFromInput(value)
      if (province) {
        setSelectedProvince(province)
        setSelectedCity(city || '')
        onAddressChange(province, city || '', undefined)
      }
    } else {
      setSearchResults([])
      setShowDropdown(false)
      setSelectedProvince('')
      setSelectedCity('')
      onAddressChange('', '', undefined)
    }
  }

  // 选择选项
  const handleOptionSelect = (option: any) => {
    setInputValue(option.fullName)
    setSelectedProvince(option.province)
    setSelectedCity(option.city)
    setSelectedProvinceCity(option.fullName)
    setShowDropdown(false)
    setSearchResults([])
    onAddressChange(option.province, option.city, undefined)
  }

  // 处理输入框焦点
  const handleInputFocus = () => {
    if (inputValue.trim()) {
      setShowDropdown(true)
    } else {
      // 如果没有输入内容，显示所有选项
      setSearchResults(getAllProvinceCityOptions())
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
  }

  // 清除所有输入
  const clearAll = () => {
    setTextInput('')
    setSelectedProvince('')
    setSelectedCity('')
    setSelectedProvinceCity('')
    setInputValue('')
    setShowDropdown(false)
    setParsedAddress(null)
    setIsValid(false)
    setSearchResults([])
    setShowSearchResults(false)
    setSearchQuery('')
    onWeightChange(0)
    onAddressChange('', '', undefined)
    if (onClearAll) {
      onClearAll()
    }
  }

  return (
    <div className="space-y-6">
      {/* 输入模式切换 */}
      <Tabs value={mode} onValueChange={(value) => {
        setMode(value as InputMode)
        // 切换模式时清除所有内容
        setTextInput('')
        setSelectedProvince('')
        setSelectedCity('')
        setSelectedProvinceCity('')
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            文字输入
          </TabsTrigger>
          <TabsTrigger value="select" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            选择模式
          </TabsTrigger>
        </TabsList>

        {/* 文字输入模式 */}
        <TabsContent value="text" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">智能地址解析</CardTitle>
              <CardDescription>
                直接粘贴包含姓名、电话、地址的完整信息，系统会自动解析
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Textarea
                  placeholder="例如：张三 13812345678 浙江省杭州市西湖区文三路123号"
                  value={textInput}
                  onChange={(e) => handleTextInput(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>
              
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
              <CardTitle className="text-lg">精确地址选择</CardTitle>
              <CardDescription>
                直接在输入框中输入或选择省份和城市，支持智能搜索
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 融合输入选择框 */}
              <div className="relative">
                <label className="block text-sm font-medium mb-2">选择地址</label>
                <div className="relative">
                  <Input
                    placeholder="输入或选择省份和城市..."
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
                          <div className="font-medium">{result.fullName}</div>
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
                value={weight > 0 ? weight.toString() : ''}
                onChange={(e) => handleWeightChange(e.target.value)}
                className="pr-10"
                min="0.01"
                step="0.1"
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
