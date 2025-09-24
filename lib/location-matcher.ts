// lib/location-matcher.ts
import { Location } from './loadLocations';

/**
 * 智能匹配用户输入的地区名称到标准地区
 * @param userInput 用户输入的地址
 * @param locations 标准地区列表
 * @returns 匹配到的标准地区，如果没有匹配则返回null
 */
export function matchLocation(userInput: string, locations: Location[]): Location | null {
  if (!userInput || !userInput.trim()) return null;
  
  const input = userInput.trim().toLowerCase();
  
  // 1. 精确匹配
  const exactMatch = locations.find(location => 
    location.name.toLowerCase() === input
  );
  if (exactMatch) return exactMatch;
  
  // 2. 包含匹配
  const containsMatch = locations.find(location => 
    location.name.toLowerCase().includes(input) || 
    input.includes(location.name.toLowerCase())
  );
  if (containsMatch) return containsMatch;
  
  // 3. 省份简称匹配
  const provinceShort = input.replace('省', '').replace('市', '').replace('自治区', '').replace('特别行政区', '');
  if (provinceShort.length > 1) {
    const provinceMatch = locations.find(location => {
      const locationShort = location.name.toLowerCase()
        .replace('省', '').replace('市', '').replace('自治区', '').replace('特别行政区', '');
      return locationShort === provinceShort || locationShort.includes(provinceShort);
    });
    if (provinceMatch) return provinceMatch;
  }
  
  // 4. 城市简称匹配
  const cityShort = input.replace('市', '').replace('区', '').replace('县', '');
  if (cityShort.length > 1) {
    const cityMatch = locations.find(location => {
      const locationShort = location.name.toLowerCase()
        .replace('市', '').replace('区', '').replace('县', '');
      return locationShort === cityShort || locationShort.includes(cityShort);
    });
    if (cityMatch) return cityMatch;
  }
  
  // 5. 部分匹配
  const partialMatch = locations.find(location => {
    const locationName = location.name.toLowerCase();
    
    // 检查用户输入是否包含在地点名称中
    if (locationName.includes(input)) return true;
    
    // 检查地点名称是否包含在用户输入中
    if (input.includes(locationName)) return true;
    
    // 检查部分字符匹配
    const inputChars = input.split('');
    const locationChars = locationName.split('');
    
    // 如果输入字符数少于3，要求完全匹配
    if (inputChars.length < 3) return false;
    
    // 计算匹配度
    let matchCount = 0;
    for (const char of inputChars) {
      if (locationChars.includes(char)) {
        matchCount++;
      }
    }
    
    // 如果匹配度超过70%，认为是匹配
    return matchCount / inputChars.length > 0.7;
  });
  
  return partialMatch || null;
}

/**
 * 从地址字符串中提取省份和城市信息，返回候选地点列表（按优先级排序）
 * @param address 完整地址字符串
 * @param locations 标准地区列表
 * @returns 解析后的省份和城市信息，以及候选地点列表
 */
export function parseAddressWithLocations(address: string, locations: Location[]): {
  province: string;
  city: string;
  matchedLocation: Location | null;
  candidateLocations: Location[];
} {
  if (!address || !address.trim()) {
    return { province: '', city: '', matchedLocation: null, candidateLocations: [] };
  }
  
  const input = address.trim();
  
  // 1. 首先尝试精确匹配整个地址
  const exactMatch = locations.find(location => 
    location.name.toLowerCase() === input.toLowerCase()
  );
  if (exactMatch) {
    return {
      province: exactMatch.name,
      city: exactMatch.name,
      matchedLocation: exactMatch,
      candidateLocations: [exactMatch]
    };
  }
  
  // 2. 收集所有匹配的地点，按优先级排序
  const allMatches = locations.filter(location => {
    const locationName = location.name.toLowerCase();
    return input.toLowerCase().includes(locationName) || locationName.includes(input.toLowerCase());
  }).sort((a, b) => {
    // 排序规则：
    // 1. 城市级别 > 省份级别
    const aIsCity = a.name.includes('市') || a.name.includes('县') || a.name.includes('区');
    const bIsCity = b.name.includes('市') || b.name.includes('县') || b.name.includes('区');
    
    if (aIsCity && !bIsCity) return -1;
    if (!aIsCity && bIsCity) return 1;
    
    // 2. 更具体的名称优先（长度更长）
    return b.name.length - a.name.length;
  });
  
  if (allMatches.length > 0) {
    const bestMatch = allMatches[0];
    
    // 如果最佳匹配是城市级别，还需要添加对应的省份级别匹配
    if (bestMatch.name.includes('市') || bestMatch.name.includes('县') || bestMatch.name.includes('区')) {
      // 尝试找到对应的省份
      const provinceName = extractProvinceFromCity(bestMatch.name);
      if (provinceName) {
        const provinceMatch = locations.find(loc => loc.name === provinceName);
        if (provinceMatch && !allMatches.find(m => m.id === provinceMatch.id)) {
          allMatches.push(provinceMatch);
        }
      }
    }
    
    return {
      province: bestMatch.name,
      city: bestMatch.name,
      matchedLocation: bestMatch,
      candidateLocations: allMatches
    };
  }
  
  // 3. 如果没找到匹配，尝试解析复合地址（如"广东省清远市"）
  const addressParts = input.split(/[，,。.\s]+/);
  let matchedProvince = '';
  let matchedCity = '';
  let matchedLocation: Location | null = null;
  let candidateLocations: Location[] = [];
  
  // 先找城市级别的匹配
  for (const part of addressParts) {
    if (!part.trim()) continue;
    
    const cityMatch = locations.find(location => {
      const locationName = location.name.toLowerCase();
      const partName = part.trim().toLowerCase();
      
      // 城市级别的精确匹配
      if (locationName === partName) return true;
      
      // 城市级别的包含匹配
      if (locationName.includes(partName) || partName.includes(locationName)) {
        // 优先城市级别
        return location.name.includes('市') || location.name.includes('县') || location.name.includes('区');
      }
      
      return false;
    });
    
    if (cityMatch) {
      matchedCity = cityMatch.name;
      matchedLocation = cityMatch;
      candidateLocations.push(cityMatch);
      
      // 添加对应的省份匹配
      const provinceName = extractProvinceFromCity(cityMatch.name);
      if (provinceName) {
        const provinceMatch = locations.find(loc => loc.name === provinceName);
        if (provinceMatch) {
          candidateLocations.push(provinceMatch);
        }
      }
      break;
    }
  }
  
  // 如果没找到城市级别，再找省份级别
  if (!matchedLocation) {
    for (const part of addressParts) {
      if (!part.trim()) continue;
      
      const provinceMatch = locations.find(location => {
        const locationName = location.name.toLowerCase();
        const partName = part.trim().toLowerCase();
        
        // 省份级别的精确匹配
        if (locationName === partName) return true;
        
        // 省份级别的包含匹配
        if (locationName.includes(partName) || partName.includes(locationName)) {
          // 省份级别
          return location.name.includes('省') || location.name.includes('自治区') || location.name.includes('特别行政区');
        }
        
        return false;
      });
      
      if (provinceMatch) {
        matchedProvince = provinceMatch.name;
        matchedLocation = provinceMatch;
        candidateLocations.push(provinceMatch);
        break;
      }
    }
  }
  
  return {
    province: matchedProvince || matchedCity,
    city: matchedCity || matchedProvince,
    matchedLocation,
    candidateLocations
  };
}

/**
 * 从城市名称中提取省份名称
 * @param cityName 城市名称，如"阳江市"
 * @returns 省份名称，如"广东省"，如果无法提取则返回null
 */
function extractProvinceFromCity(cityName: string): string | null {
  // 根据城市名称推断省份 - 通用实现
  const cityToProvinceMap: { [key: string]: string } = {
    // 广东省
    '阳江市': '广东省', '清远市': '广东省', '韶关市': '广东省', '茂名市': '广东省',
    '湛江市': '广东省', '云浮市': '广东省', '肇庆市': '广东省', '广州市': '广东省',
    '深圳市': '广东省', '珠海市': '广东省', '汕头市': '广东省', '佛山市': '广东省',
    '江门市': '广东省', '惠州市': '广东省', '梅州市': '广东省', '汕尾市': '广东省',
    '河源市': '广东省', '东莞市': '广东省', '中山市': '广东省', '潮州市': '广东省',
    '揭阳市': '广东省',
    
    // 江苏省
    '南京市': '江苏省', '苏州市': '江苏省', '无锡市': '江苏省', '常州市': '江苏省',
    '镇江市': '江苏省', '扬州市': '江苏省', '泰州市': '江苏省', '南通市': '江苏省',
    '徐州市': '江苏省', '淮安市': '江苏省', '盐城市': '江苏省', '连云港市': '江苏省',
    '宿迁市': '江苏省',
    
    // 浙江省
    '杭州市': '浙江省', '宁波市': '浙江省', '温州市': '浙江省', '嘉兴市': '浙江省',
    '湖州市': '浙江省', '绍兴市': '浙江省', '金华市': '浙江省', '衢州市': '浙江省',
    '舟山市': '浙江省', '台州市': '浙江省', '丽水市': '浙江省',
    
    // 山东省
    '济南市': '山东省', '青岛市': '山东省', '淄博市': '山东省', '枣庄市': '山东省',
    '东营市': '山东省', '烟台市': '山东省', '潍坊市': '山东省', '济宁市': '山东省',
    '泰安市': '山东省', '威海市': '山东省', '日照市': '山东省', '临沂市': '山东省',
    '德州市': '山东省', '聊城市': '山东省', '滨州市': '山东省', '菏泽市': '山东省',
    
    // 河北省
    '石家庄市': '河北省', '唐山市': '河北省', '秦皇岛市': '河北省', '邯郸市': '河北省',
    '邢台市': '河北省', '保定市': '河北省', '张家口市': '河北省', '承德市': '河北省',
    '沧州市': '河北省', '廊坊市': '河北省', '衡水市': '河北省',
    
    // 河南省
    '郑州市': '河南省', '开封市': '河南省', '洛阳市': '河南省', '平顶山市': '河南省',
    '安阳市': '河南省', '鹤壁市': '河南省', '新乡市': '河南省', '焦作市': '河南省',
    '濮阳市': '河南省', '许昌市': '河南省', '漯河市': '河南省', '三门峡市': '河南省',
    '南阳市': '河南省', '商丘市': '河南省', '信阳市': '河南省', '周口市': '河南省',
    '驻马店市': '河南省', '济源市': '河南省',
    
    // 四川省
    '成都市': '四川省', '自贡市': '四川省', '攀枝花市': '四川省', '泸州市': '四川省',
    '德阳市': '四川省', '绵阳市': '四川省', '广元市': '四川省', '遂宁市': '四川省',
    '内江市': '四川省', '乐山市': '四川省', '南充市': '四川省', '眉山市': '四川省',
    '宜宾市': '四川省', '广安市': '四川省', '达州市': '四川省', '雅安市': '四川省',
    '巴中市': '四川省', '资阳市': '四川省',
    
    // 湖北省
    '武汉市': '湖北省', '黄石市': '湖北省', '十堰市': '湖北省', '宜昌市': '湖北省',
    '襄阳市': '湖北省', '鄂州市': '湖北省', '荆门市': '湖北省', '孝感市': '湖北省',
    '荆州市': '湖北省', '黄冈市': '湖北省', '咸宁市': '湖北省', '随州市': '湖北省',
    
    // 湖南省
    '长沙市': '湖南省', '株洲市': '湖南省', '湘潭市': '湖南省', '衡阳市': '湖南省',
    '邵阳市': '湖南省', '岳阳市': '湖南省', '常德市': '湖南省', '张家界市': '湖南省',
    '益阳市': '湖南省', '郴州市': '湖南省', '永州市': '湖南省', '怀化市': '湖南省',
    '娄底市': '湖南省',
    
    // 安徽省
    '合肥市': '安徽省', '芜湖市': '安徽省', '蚌埠市': '安徽省', '淮南市': '安徽省',
    '马鞍山市': '安徽省', '淮北市': '安徽省', '铜陵市': '安徽省', '安庆市': '安徽省',
    '黄山市': '安徽省', '滁州市': '安徽省', '阜阳市': '安徽省', '宿州市': '安徽省',
    '六安市': '安徽省', '亳州市': '安徽省', '池州市': '安徽省', '宣城市': '安徽省',
    
    // 福建省
    '福州市': '福建省', '厦门市': '福建省', '莆田市': '福建省', '三明市': '福建省',
    '泉州市': '福建省', '漳州市': '福建省', '南平市': '福建省', '龙岩市': '福建省',
    '宁德市': '福建省',
    
    // 江西省
    '南昌市': '江西省', '景德镇市': '江西省', '萍乡市': '江西省', '九江市': '江西省',
    '新余市': '江西省', '鹰潭市': '江西省', '赣州市': '江西省', '吉安市': '江西省',
    '宜春市': '江西省', '抚州市': '江西省', '上饶市': '江西省',
    
    // 辽宁省
    '沈阳市': '辽宁省', '大连市': '辽宁省', '鞍山市': '辽宁省', '抚顺市': '辽宁省',
    '本溪市': '辽宁省', '丹东市': '辽宁省', '锦州市': '辽宁省', '营口市': '辽宁省',
    '阜新市': '辽宁省', '辽阳市': '辽宁省', '盘锦市': '辽宁省', '铁岭市': '辽宁省',
    '朝阳市': '辽宁省', '葫芦岛市': '辽宁省',
    
    // 吉林省
    '长春市': '吉林省', '吉林市': '吉林省', '四平市': '吉林省', '辽源市': '吉林省',
    '通化市': '吉林省', '白山市': '吉林省', '松原市': '吉林省', '白城市': '吉林省',
    
    // 黑龙江省
    '哈尔滨市': '黑龙江省', '齐齐哈尔市': '黑龙江省', '鸡西市': '黑龙江省', '鹤岗市': '黑龙江省',
    '双鸭山市': '黑龙江省', '大庆市': '黑龙江省', '伊春市': '黑龙江省', '佳木斯市': '黑龙江省',
    '七台河市': '黑龙江省', '牡丹江市': '黑龙江省', '黑河市': '黑龙江省', '绥化市': '黑龙江省',
    
    // 陕西省
    '西安市': '陕西省', '铜川市': '陕西省', '宝鸡市': '陕西省', '咸阳市': '陕西省',
    '渭南市': '陕西省', '延安市': '陕西省', '汉中市': '陕西省', '榆林市': '陕西省',
    '安康市': '陕西省', '商洛市': '陕西省',
    
    // 甘肃省
    '兰州市': '甘肃省', '嘉峪关市': '甘肃省', '金昌市': '甘肃省', '白银市': '甘肃省',
    '天水市': '甘肃省', '武威市': '甘肃省', '张掖市': '甘肃省', '平凉市': '甘肃省',
    '酒泉市': '甘肃省', '庆阳市': '甘肃省', '定西市': '甘肃省', '陇南市': '甘肃省',
    
    // 青海省
    '西宁市': '青海省', '海东市': '青海省',
    
    // 宁夏回族自治区
    '银川市': '宁夏回族自治区', '石嘴山市': '宁夏回族自治区', '吴忠市': '宁夏回族自治区',
    '固原市': '宁夏回族自治区', '中卫市': '宁夏回族自治区',
    
    // 新疆维吾尔自治区
    '乌鲁木齐市': '新疆维吾尔自治区', '克拉玛依市': '新疆维吾尔自治区',
    
    // 西藏自治区
    '拉萨市': '西藏自治区', '日喀则市': '西藏自治区', '昌都市': '西藏自治区',
    '林芝市': '西藏自治区', '山南市': '西藏自治区', '那曲市': '西藏自治区',
    
    // 内蒙古自治区
    '呼和浩特市': '内蒙古自治区', '包头市': '内蒙古自治区', '乌海市': '内蒙古自治区',
    '赤峰市': '内蒙古自治区', '通辽市': '内蒙古自治区', '鄂尔多斯市': '内蒙古自治区',
    '呼伦贝尔市': '内蒙古自治区', '巴彦淖尔市': '内蒙古自治区', '乌兰察布市': '内蒙古自治区',
    
    // 广西壮族自治区
    '南宁市': '广西壮族自治区', '柳州市': '广西壮族自治区', '桂林市': '广西壮族自治区',
    '梧州市': '广西壮族自治区', '北海市': '广西壮族自治区', '防城港市': '广西壮族自治区',
    '钦州市': '广西壮族自治区', '贵港市': '广西壮族自治区', '玉林市': '广西壮族自治区',
    '百色市': '广西壮族自治区', '贺州市': '广西壮族自治区', '河池市': '广西壮族自治区',
    '来宾市': '广西壮族自治区', '崇左市': '广西壮族自治区',
    
    // 云南省
    '昆明市': '云南省', '曲靖市': '云南省', '玉溪市': '云南省', '保山市': '云南省',
    '昭通市': '云南省', '丽江市': '云南省', '普洱市': '云南省', '临沧市': '云南省',
    '楚雄彝族自治州': '云南省', '红河哈尼族彝族自治州': '云南省', '文山壮族苗族自治州': '云南省',
    '西双版纳傣族自治州': '云南省', '大理白族自治州': '云南省', '德宏傣族景颇族自治州': '云南省',
    '怒江傈僳族自治州': '云南省', '迪庆藏族自治州': '云南省',
    
    // 贵州省
    '贵阳市': '贵州省', '六盘水市': '贵州省', '遵义市': '贵州省', '安顺市': '贵州省',
    '毕节市': '贵州省', '铜仁市': '贵州省',
    
    // 直辖市
    '北京市': '北京市', '天津市': '天津市', '上海市': '上海市', '重庆市': '重庆市',
    
    // 特别行政区
    '香港特别行政区': '香港特别行政区', '澳门特别行政区': '澳门特别行政区',
    
    // 台湾省
    '台北市': '台湾省', '高雄市': '台湾省', '台中市': '台湾省', '台南市': '台湾省',
    '新北市': '台湾省', '桃园市': '台湾省', '基隆市': '台湾省', '新竹市': '台湾省',
    '嘉义市': '台湾省',
  };
  
  return cityToProvinceMap[cityName] || null;
}
