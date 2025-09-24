// types/pricing.ts

// 描述价格分段的最小单元
export interface PriceTier {
  upToKg: number | null;     // 重量上限（null 代表无穷大）
  pricePerKg?: number;      // 该区间的每公斤单价
  flatPrice?: number;       // 该区단의固定价格
  baseFee?: number;         // 该区间的固定基础费用
}

// 描述所有可能的计价模型
export type PricingModel = 
  | {
      type: 'tiered_minimum_charge'; // 起步价 + 分段续重
      minimumCharge: number;
      tiers: PriceTier[];
    }
  | {
      type: 'first_additional';      // 传统首重续重
      firstWeightKg: number;
      firstWeightPrice: number;
      additionalWeightPricePerKg: number;
      exceptionThresholdKg?: number; // <-- 新增：例外阈值 (可选)
      exceptionFormula?: 'per_kg_only'; // <-- 新增：例外公式 (可选)
    }
  | {
      type: 'complex_tiered';        // 复杂分段（支持固定价格和进位）
      rounding?: 'up_to_0.2' | 'up_to_1' | 'none'; // 进位规则 (可选)
      tiers: PriceTier[];
    }
  | {
      type: 'first_plus_tiered_flat_rate'; // 首重 + 固定价格分段
      firstWeightKg: number;
      firstWeightPrice: number;
      tiers: PriceTier[];
    };

// 描述从 Airtable 读取并处理好的一条完整价格规则
export interface PriceRule {
  RuleName?: string;
  Company?: string[];
  CompanyName?: string; // 物流公司名称
  Client?: string[];
  Destination?: string;
  ModelType?: 'first_additional' | 'tiered_minimum_charge' | 'complex_tiered' | 'first_plus_tiered_flat_rate';
  MinimumCharge?: number;
  FirstWeightPrice?: number;
  FirstWeightKg?: number; // 首重重量
  AdditionalWeightPricePerKg?: number;
  Tiers?: PriceTier[]; // 注意这里是处理好的对象数组，不是字符串
  Timeliness?: string;
  // 新增的例外规则字段
  ExceptionThresholdKg?: number; // 例外阈值重量
  ExceptionFormula?: 'per_kg_only'; // 例外公式类型
}