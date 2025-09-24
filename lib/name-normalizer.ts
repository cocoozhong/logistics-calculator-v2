/**
 * 省市名标准化工具
 * 处理各种行政区划后缀，确保与数据源匹配
 */

// 省份标准化映射
const PROVINCE_NORMALIZE_MAP: { [key: string]: string } = {
  // 直辖市
  '北京': '北京',
  '北京市': '北京',
  '上海': '上海', 
  '上海市': '上海',
  '天津': '天津',
  '天津市': '天津',
  '重庆': '重庆',
  '重庆市': '重庆',
  
  // 省
  '河北': '河北',
  '河北省': '河北',
  '山西': '山西', 
  '山西省': '山西',
  '辽宁': '辽宁',
  '辽宁省': '辽宁',
  '吉林': '吉林',
  '吉林省': '吉林',
  '黑龙江': '黑龙江',
  '黑龙江省': '黑龙江',
  '江苏': '江苏',
  '江苏省': '江苏',
  '浙江': '浙江',
  '浙江省': '浙江',
  '安徽': '安徽',
  '安徽省': '安徽',
  '福建': '福建',
  '福建省': '福建',
  '江西': '江西',
  '江西省': '江西',
  '山东': '山东',
  '山东省': '山东',
  '河南': '河南',
  '河南省': '河南',
  '湖北': '湖北',
  '湖北省': '湖北',
  '湖南': '湖南',
  '湖南省': '湖南',
  '广东': '广东',
  '广东省': '广东',
  '海南': '海南',
  '海南省': '海南',
  '四川': '四川',
  '四川省': '四川',
  '贵州': '贵州',
  '贵州省': '贵州',
  '云南': '云南',
  '云南省': '云南',
  '陕西': '陕西',
  '陕西省': '陕西',
  '甘肃': '甘肃',
  '甘肃省': '甘肃',
  '青海': '青海',
  '青海省': '青海',
  
  // 自治区
  '内蒙古': '内蒙古',
  '内蒙古自治区': '内蒙古',
  '广西': '广西',
  '广西壮族自治区': '广西',
  '西藏': '西藏',
  '西藏自治区': '西藏',
  '宁夏': '宁夏',
  '宁夏回族自治区': '宁夏',
  '新疆': '新疆',
  '新疆维吾尔自治区': '新疆',
  
  // 特别行政区
  '香港': '香港',
  '香港特别行政区': '香港',
  '澳门': '澳门',
  '澳门特别行政区': '澳门'
}

// 城市后缀标准化
const CITY_SUFFIXES = [
  '市', '县', '区', '旗', '盟', '州', '自治州', '地区', '特别行政区'
]

/**
 * 标准化省份名称
 * @param province 原始省份名
 * @returns 标准化后的省份名
 */
export function normalizeProvince(province: string): string {
  if (!province) return ''
  
  const trimmed = province.trim()
  
  // 直接映射
  if (PROVINCE_NORMALIZE_MAP[trimmed]) {
    return PROVINCE_NORMALIZE_MAP[trimmed]
  }
  
  // 模糊匹配
  for (const [key, value] of Object.entries(PROVINCE_NORMALIZE_MAP)) {
    if (key.includes(trimmed) || trimmed.includes(key)) {
      return value
    }
  }
  
  // 如果都没匹配到，返回原值
  return trimmed
}

/**
 * 标准化城市名称
 * @param city 原始城市名
 * @returns 标准化后的城市名
 */
export function normalizeCity(city: string): string {
  if (!city) return ''
  
  let trimmed = city.trim()
  
  // 移除常见的行政区划后缀
  for (const suffix of CITY_SUFFIXES) {
    if (trimmed.endsWith(suffix)) {
      trimmed = trimmed.slice(0, -suffix.length)
      break
    }
  }
  
  return trimmed
}

/**
 * 标准化省市名称组合
 * @param province 省份名
 * @param city 城市名
 * @returns 标准化后的省市名
 */
export function normalizeProvinceCity(province: string, city: string): { province: string; city: string } {
  return {
    province: normalizeProvince(province),
    city: normalizeCity(city)
  }
}

/**
 * 检查两个省份名是否相同（考虑标准化）
 * @param province1 省份1
 * @param province2 省份2
 * @returns 是否相同
 */
export function isSameProvince(province1: string, province2: string): boolean {
  return normalizeProvince(province1) === normalizeProvince(province2)
}

/**
 * 检查两个城市名是否相同（考虑标准化）
 * @param city1 城市1
 * @param city2 城市2
 * @returns 是否相同
 */
export function isSameCity(city1: string, city2: string): boolean {
  return normalizeCity(city1) === normalizeCity(city2)
}

/**
 * 模糊匹配城市名（支持部分匹配）
 * @param targetCity 目标城市名
 * @param candidateCity 候选城市名
 * @returns 是否匹配
 */
export function fuzzyMatchCity(targetCity: string, candidateCity: string): boolean {
  const normalizedTarget = normalizeCity(targetCity)
  const normalizedCandidate = normalizeCity(candidateCity)
  
  // 完全匹配
  if (normalizedTarget === normalizedCandidate) {
    return true
  }
  
  // 包含匹配（目标城市包含在候选城市中，或候选城市包含在目标城市中）
  if (normalizedTarget.includes(normalizedCandidate) || normalizedCandidate.includes(normalizedTarget)) {
    return true
  }
  
  return false
}

/**
 * 获取所有支持的省份名（用于调试）
 * @returns 省份名列表
 */
export function getAllSupportedProvinces(): string[] {
  return Object.keys(PROVINCE_NORMALIZE_MAP)
}

/**
 * 获取所有支持的城市后缀（用于调试）
 * @returns 城市后缀列表
 */
export function getAllCitySuffixes(): string[] {
  return [...CITY_SUFFIXES]
}
