import { ParsedAddress } from './types'

// 省份列表
const PROVINCES = [
  '北京市', '天津市', '河北省', '山西省', '内蒙古', '辽宁省', '吉林省', '黑龙江省',
  '上海市', '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省', '河南省',
  '湖北省', '湖南省', '广东省', '广西', '海南省', '重庆市', '四川省', '贵州省',
  '云南省', '西藏', '陕西省', '甘肃省', '青海省', '宁夏', '新疆'
]

// 城市关键词
const CITY_KEYWORDS = [
  '市', '县', '区', '旗', '盟', '州', '省', '自治区', '特别行政区'
]

// 电话号码正则
const PHONE_REGEX = /(1[3-9]\d{9}|0\d{2,3}-?\d{7,8}|400-?\d{3}-?\d{4})/g

// 姓名正则（中文姓名）
const NAME_REGEX = /[\u4e00-\u9fa5]{2,4}(?=\s|$|，|,)/g

/**
 * 智能地址解析函数
 * @param text 包含地址信息的文本
 * @returns 解析后的地址信息
 */
export function parseAddress(text: string): ParsedAddress {
  // 清理文本
  const cleanText = text.replace(/\s+/g, ' ').trim()
  
  // 提取电话号码
  const phoneMatch = cleanText.match(PHONE_REGEX)
  const phone = phoneMatch ? phoneMatch[0] : undefined
  
  // 先解析省份和城市
  const { province, city } = parseProvinceCity(cleanText)
  
  // 移除省份、城市和电话，获取剩余文本
  let remainingText = cleanText
  if (phone) {
    remainingText = remainingText.replace(phone, '').trim()
  }
  if (province) {
    remainingText = remainingText.replace(province, '').trim()
  }
  if (city) {
    remainingText = remainingText.replace(city, '').trim()
  }
  
  // 从剩余文本中提取姓名（避免把城市名当作姓名）
  const nameMatch = remainingText.match(NAME_REGEX)
  const name = nameMatch ? nameMatch[0] : undefined
  
  return {
    province,
    city,
    name,
    phone,
    address: cleanText
  }
}

/**
 * 解析省份和城市
 * @param addressText 地址文本
 * @returns 省份和城市
 */
function parseProvinceCity(addressText: string): { province: string; city: string } {
  let province = ''
  let city = ''
  
  // 查找省份（支持部分匹配）
  for (const prov of PROVINCES) {
    if (addressText.includes(prov)) {
      province = prov
      break
    }
  }
  
  // 如果找到省份，继续查找城市
  if (province) {
    // 获取省份前后的文本，扩大搜索范围
    const provinceIndex = addressText.indexOf(province)
    const searchStart = Math.max(0, provinceIndex - 20)
    const searchEnd = Math.min(addressText.length, provinceIndex + province.length + 50)
    const searchText = addressText.substring(searchStart, searchEnd)
    
    // 查找城市关键词（支持更灵活的匹配）
    for (const keyword of CITY_KEYWORDS) {
      // 匹配省份后的城市
      const afterProvince = searchText.substring(searchText.indexOf(province) + province.length)
      const cityMatch = afterProvince.match(new RegExp(`([^，,。\\s]{2,10}${keyword})`))
      if (cityMatch) {
        city = cityMatch[1]
        break
      }
      
      // 也匹配省份前的城市（处理"金华市浙江省"这样的格式）
      const beforeProvince = searchText.substring(0, searchText.indexOf(province))
      const cityMatchBefore = beforeProvince.match(new RegExp(`([^，,。\\s]{2,10}${keyword})`))
      if (cityMatchBefore) {
        city = cityMatchBefore[1]
        break
      }
    }
    
    // 如果没有找到带关键词的城市，尝试智能推断
    if (!city) {
      const afterProvince = searchText.substring(searchText.indexOf(province) + province.length).trim()
      const words = afterProvince.split(/[，,。\s]/).filter(word => word.length > 0)
      
      if (words.length > 0) {
        const firstWord = words[0]
        // 如果第一个词看起来像城市名，直接使用
        if (CITY_KEYWORDS.some(keyword => firstWord.includes(keyword))) {
          city = firstWord
        } else if (firstWord.length >= 2 && firstWord.length <= 6) {
          // 尝试添加"市"后缀
          city = firstWord + '市'
        }
      }
    }
  }
  
  // 如果没有找到省份，尝试从城市推断省份
  if (!province && city) {
    province = inferProvinceFromCity(city)
  }
  
  // 如果还是没有找到省份，尝试直接匹配城市名
  if (!province && !city) {
    // 查找所有可能的城市名
    for (const keyword of CITY_KEYWORDS) {
      const cityMatch = addressText.match(new RegExp(`([^，,。\\s]{2,10}${keyword})`))
      if (cityMatch) {
        city = cityMatch[1]
        province = inferProvinceFromCity(city)
        if (province) break
      }
    }
  }
  
  return { province, city }
}

/**
 * 从城市推断省份
 * @param city 城市名
 * @returns 省份名
 */
function inferProvinceFromCity(city: string): string {
  // 直辖市映射
  const directCities: { [key: string]: string } = {
    '北京': '北京市',
    '上海': '上海市',
    '天津': '天津市',
    '重庆': '重庆市'
  }
  
  if (directCities[city]) {
    return directCities[city]
  }
  
  // 其他城市推断逻辑
  const cityProvinceMap: { [key: string]: string } = {
    // 浙江省
    '杭州': '浙江省', '宁波': '浙江省', '温州': '浙江省', '嘉兴': '浙江省', '湖州': '浙江省',
    '绍兴': '浙江省', '金华': '浙江省', '衢州': '浙江省', '舟山': '浙江省', '台州': '浙江省',
    '丽水': '浙江省', '义乌': '浙江省', '东阳': '浙江省', '永康': '浙江省', '兰溪': '浙江省',
    '富阳': '浙江省', '临安': '浙江省', '诸暨': '浙江省', '上虞': '浙江省', '嵊州': '浙江省',
    '慈溪': '浙江省', '余姚': '浙江省', '海宁': '浙江省', '桐乡': '浙江省', '乐清': '浙江省',
    '温岭': '浙江省', '奉化': '浙江省', '瑞安': '浙江省',
    
    // 江苏省
    '南京': '江苏省', '苏州': '江苏省', '无锡': '江苏省', '常州': '江苏省', '镇江': '江苏省',
    '南通': '江苏省', '泰州': '江苏省', '扬州': '江苏省', '盐城': '江苏省', '连云港': '江苏省',
    '徐州': '江苏省', '淮安': '江苏省', '宿迁': '江苏省', '江阴': '江苏省', '宜兴': '江苏省',
    '新沂': '江苏省', '邳州': '江苏省', '溧阳': '江苏省', '金坛': '江苏省', '张家港': '江苏省',
    '常熟': '江苏省', '太仓': '江苏省', '昆山': '江苏省', '吴江': '江苏省', '如皋': '江苏省',
    '启东': '江苏省', '海门': '江苏省', '东台': '江苏省', '大丰': '江苏省', '高邮': '江苏省',
    '仪征': '江苏省', '丹阳': '江苏省', '扬中': '江苏省', '句容': '江苏省', '泰兴': '江苏省',
    '靖江': '江苏省', '兴化': '江苏省', '姜堰': '江苏省', '高港': '江苏省',
    
    // 广东省
    '广州': '广东省', '深圳': '广东省', '珠海': '广东省', '汕头': '广东省', '佛山': '广东省',
    '韶关': '广东省', '湛江': '广东省', '肇庆': '广东省', '江门': '广东省', '茂名': '广东省',
    '惠州': '广东省', '梅州': '广东省', '汕尾': '广东省', '河源': '广东省', '阳江': '广东省',
    '清远': '广东省', '东莞': '广东省', '中山': '广东省', '潮州': '广东省', '揭阳': '广东省',
    '云浮': '广东省', '普宁': '广东省', '化州': '广东省', '信宜': '广东省', '潮汕': '广东省',
    '鹤山': '广东省', '恩平': '广东省', '台山': '广东省', '开平': '广东省', '陆丰': '广东省',
    '雷州': '广东省', '阳西': '广东省', '阳春': '广东省', '高州': '广东省',
    
    // 其他省份主要城市
    '成都': '四川省', '重庆': '重庆市', '西安': '陕西省', '武汉': '湖北省', '长沙': '湖南省',
    '郑州': '河南省', '济南': '山东省', '青岛': '山东省', '石家庄': '河北省', '太原': '山西省',
    '沈阳': '辽宁省', '大连': '辽宁省', '长春': '吉林省', '哈尔滨': '黑龙江', '合肥': '安徽省',
    '福州': '福建省', '厦门': '福建省', '南昌': '江西省', '南宁': '广西省', '海口': '海南省',
    '昆明': '云南省', '贵阳': '贵州省', '兰州': '甘肃省', '西宁': '青海省', '银川': '宁夏',
    '乌鲁木齐': '新疆', '拉萨': '西藏', '呼和浩特': '内蒙古', '包头': '内蒙古'
  }
  
  return cityProvinceMap[city] || ''
}

/**
 * 验证地址是否有效
 * @param parsedAddress 解析后的地址
 * @returns 是否有效
 */
export function validateAddress(parsedAddress: ParsedAddress): boolean {
  return !!(parsedAddress.province && parsedAddress.city)
}

/**
 * 格式化地址显示
 * @param parsedAddress 解析后的地址
 * @returns 格式化后的地址字符串
 */
export function formatAddress(parsedAddress: ParsedAddress): string {
  const parts = []
  
  if (parsedAddress.name) {
    parts.push(`姓名：${parsedAddress.name}`)
  }
  
  if (parsedAddress.phone) {
    parts.push(`电话：${parsedAddress.phone}`)
  }
  
  if (parsedAddress.province && parsedAddress.city) {
    parts.push(`地址：${parsedAddress.province} ${parsedAddress.city}`)
  }
  
  return parts.join('\n')
}
