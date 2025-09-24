import { ProvinceCity, SearchResult } from './types'

// 省份城市数据
export const PROVINCE_CITY_DATA: ProvinceCity[] = [
  {
    province: '江苏省',
    cities: ['南京市', '苏州市', '无锡市', '常州市', '镇江市', '南通市', '泰州市', '扬州市', '盐城市', '连云港市', '徐州市', '淮安市', '宿迁市', '张家港市', '常熟市', '昆山市', '江阴市', '金坛市', '丹阳市', '高港市', '泰兴市', '邳州市', '吴江市']
  },
  {
    province: '浙江省',
    cities: ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市', '舟山市', '台州市', '丽水市', '富阳市', '临安市', '诸暨市', '上虞市', '嵊州市', '慈溪市', '余姚市', '海宁市', '桐乡市', '东阳市', '兰溪市', '永康市', '义乌市', '乐清市', '温岭市', '奉化市', '瑞安市']
  },
  {
    province: '上海市',
    cities: ['上海市']
  },
  {
    province: '北京市',
    cities: ['北京']
  },
  {
    province: '天津市',
    cities: ['天津']
  },
  {
    province: '重庆市',
    cities: ['重庆']
  },
  {
    province: '广东省',
    cities: ['广州市', '深圳市', '珠海市', '汕头市', '佛山市', '韶关市', '湛江市', '肇庆市', '江门市', '茂名市', '惠州市', '梅州市', '汕尾市', '河源市', '阳江市', '清远市', '东莞市', '中山市', '潮州市', '揭阳市', '云浮市', '普宁市', '化州市', '信宜市', '潮汕', '鹤山市', '恩平市', '台山市', '陆丰市', '雷州市', '阳西县', '阳春市', '高州市']
  },
  {
    province: '山东省',
    cities: ['济南市', '德州市', '章丘市', '聊城市', '泰安市', '济宁市', '枣庄市', '肥城市', '菏泽市', '莱阳市', '烟台市', '青岛市', '临沂市', '日照市', '潍坊市', '东营市', '滨州市', '淄博市', '新泰市', '莱芜市', '威海市', '蓬莱市']
  },
  {
    province: '河南省',
    cities: ['郑州市', '许昌市', '安阳市', '洛阳市', '平顶山市', '开封市', '焦作市', '新乡市', '周口市', '濮阳市', '三门峡市', '鹤壁市', '南阳市', '漯河市', '驻马店市', '信阳市']
  },
  {
    province: '湖北省',
    cities: ['武汉市', '仙桃市', '黄冈市', '随州市', '咸宁市', '孝感市', '天门市', '襄阳市', '潜江市', '荆州市', '黄石市', '鄂州市', '十堰市', '荆门市', '宜昌市']
  },
  {
    province: '湖南省',
    cities: ['长沙市', '益阳市', '株洲市', '湘潭市', '怀化市', '吉首市', '岳阳市', '郴州市', '永州市', '衡阳市', '常德市']
  },
  {
    province: '江西省',
    cities: ['吉安市', '九江市', '抚州市', '景德镇市', '南昌市', '鹰潭市', '宜春市', '上饶市', '萍乡市', '赣州市']
  },
  {
    province: '福建省',
    cities: ['泉州市', '莆田市', '厦门市', '龙岩市', '漳州市', '福州市', '南平市', '宁德市', '三明市']
  },
  {
    province: '安徽省',
    cities: ['滁州市', '马鞍山市', '宣城市', '合肥市', '六安市', '安庆市', '芜湖市', '铜陵市', '池州市', '宿州市', '蚌埠市', '淮北市', '亳州市', '阜阳市', '黄山市']
  },
  {
    province: '河北省',
    cities: ['石家庄市', '沧州市', '邢台市', '衡水市', '晋州市', '邯郸市', '定州市', '承德市', '廊坊市', '秦皇岛市', '张家口市', '唐山市', '保定市']
  },
  {
    province: '山西省',
    cities: ['太原市', '临汾市', '运城市', '忻州市', '宿州市', '晋中市', '阳泉市', '大同市', '长治市']
  },
  {
    province: '陕西省',
    cities: ['宝鸡市', '汉中市', '安康市', '渭南市', '咸阳市', '榆林市', '西安市', '铜川', '延安']
  },
  {
    province: '甘肃省',
    cities: ['庆阳', '天水', '兰州', '金昌', '嘉峪关', '威武', '酒泉', '白银']
  },
  {
    province: '青海省',
    cities: ['西宁', '格尔木', '玉树', '德令哈']
  },
  {
    province: '宁夏',
    cities: ['银川', '玉树']
  },
  {
    province: '新疆',
    cities: ['昌吉', '乌鲁木齐', '克拉玛依', '喀什', '叶城', '阿克苏市', '哈密', '库尔勒']
  },
  {
    province: '西藏',
    cities: ['拉萨']
  },
  {
    province: '内蒙古',
    cities: ['呼和浩特', '包头', '乌海', '赤峰', '通辽市', '满洲里', '鄂尔多斯', '锡林浩特', '二连浩特']
  },
  {
    province: '广西',
    cities: ['桂林市', '梧州市', '百色市', '钦州市', '北海市', '河池市', '南宁市', '崇左市', '凭祥市', '玉林市', '东兴市', '贵港市', '柳州市', '来宾市']
  },
  {
    province: '海南省',
    cities: ['海口', '湛江市']
  },
  {
    province: '云南省',
    cities: ['昆明市', '曲靖市', '玉溪市', '丽江市', '楚雄市', '景洪市', '大理市']
  },
  {
    province: '贵州省',
    cities: ['铜仁市', '贵阳市', '黔南布', '都匀市', '遵义市']
  },
  {
    province: '四川省',
    cities: ['成都市', '都江堰市', '彭州市', '西昌市', '攀枝花市', '资阳市', '邛崃市', '德阳市', '眉山市', '遂宁市', '泸州市', '雅安市', '崇州市', '南充市', '阿坝州', '峨眉山市', '乐山市', '绵阳市', '自贡市', '宜宾市', '内江市', '达州市', '广安市']
  },
  {
    province: '辽宁省',
    cities: ['鞍山市', '沈阳市', '本溪市', '丹东市', '抚顺市', '东港市', '康平市', '铁岭市', '凤城市', '苏家屯市', '通辽市', '大连市', '鲅鱼圈市', '兴城市', '盘锦市', '营口市', '葫芦岛市', '阜新市', '锦州市']
  },
  {
    province: '吉林省',
    cities: ['长春市', '辽源市', '白山市', '公主岭市', '吉林市', '九台市', '船营市', '四平市', '白城', '松原']
  },
  {
    province: '黑龙江省',
    cities: ['哈尔滨', '大庆', '佳木斯', '牡丹江', '七台河', '双鸭山', '齐齐哈尔', '嫩江', '鹤岗']
  }
]

// 获取所有省份
export function getAllProvinces(): string[] {
  return PROVINCE_CITY_DATA.map(item => item.province)
}

// 根据省份获取城市
export function getCitiesByProvince(province: string): string[] {
  const provinceData = PROVINCE_CITY_DATA.find(item => item.province === province)
  return provinceData ? provinceData.cities : []
}

// 搜索省份城市
export function searchProvinceCity(query: string): SearchResult[] {
  if (!query.trim()) return []
  
  const results: SearchResult[] = []
  const lowerQuery = query.toLowerCase()
  
  PROVINCE_CITY_DATA.forEach(provinceData => {
    // 搜索省份
    if (provinceData.province.toLowerCase().includes(lowerQuery)) {
      results.push({
        province: provinceData.province,
        city: '',
        fullName: provinceData.province
      })
    }
    
    // 搜索城市
    provinceData.cities.forEach(city => {
      if (city.toLowerCase().includes(lowerQuery)) {
        results.push({
          province: provinceData.province,
          city: city,
          fullName: `${provinceData.province} ${city}`
        })
      }
    })
  })
  
  return results.slice(0, 10) // 限制结果数量
}

// 验证省份城市组合
export function validateProvinceCity(province: string, city: string): boolean {
  const cities = getCitiesByProvince(province)
  return cities.includes(city)
}

// 获取所有省份+城市组合选项
export function getAllProvinceCityOptions(): SearchResult[] {
  const options: SearchResult[] = []
  
  PROVINCE_CITY_DATA.forEach(provinceData => {
    provinceData.cities.forEach(city => {
      options.push({
        province: provinceData.province,
        city: city,
        fullName: `${provinceData.province} ${city}`
      })
    })
  })
  
  return options.sort((a, b) => a.fullName.localeCompare(b.fullName, 'zh-CN'))
}
