// lib/price-calculator.ts
import { PriceRule, PricingModel } from '@/types/pricing';

// 进位函数
function applyRounding(price: number, rounding?: 'up_to_0.2' | 'up_to_1' | 'none'): number {
  if (!rounding || rounding === 'none') return price;
  
  switch (rounding) {
    case 'up_to_0.2':
      return Math.ceil(price * 5) / 5; // 向上进位到0.2
    case 'up_to_1':
      return Math.ceil(price); // 向上进位到整数
    default:
      return price;
  }
}

export function calculatePrice(weight: number, rule: PriceRule): number {
  if (weight <= 0) return 0;
  if (!rule.ModelType) throw new Error('Missing pricing model type');

  // 从规则中动态构建价格模型对象
  const model: PricingModel = {
    type: rule.ModelType!,
    // @ts-ignore
    minimumCharge: rule.MinimumCharge,
    // @ts-ignore
    tiers: rule.Tiers,
    // @ts-ignore
    firstWeightKg: rule.FirstWeightKg || 1,
    // @ts-ignore
    firstWeightPrice: rule.FirstWeightPrice,
    // @ts-ignore
    additionalWeightPricePerKg: rule.AdditionalWeightPricePerKg,
    // @ts-ignore
    exceptionThresholdKg: rule.ExceptionThresholdKg, // 新增
    // @ts-ignore
    exceptionFormula: rule.ExceptionFormula,   // 新增
  };

  switch (model.type) {
    case 'first_additional':
      if (!model.firstWeightPrice || !model.additionalWeightPricePerKg) return -1;

      // *** 关键改动在这里：检查例外规则 ***
      if (model.exceptionThresholdKg && weight >= model.exceptionThresholdKg) {
        if (model.exceptionFormula === 'per_kg_only') {
          // 如果满足例外条件，则不收首重，直接按续重单价算
          return weight * model.additionalWeightPricePerKg;
        }
      }

      // 如果不满足例外条件，或者没有例外规则，就走标准的首重+续重逻辑
      if (weight <= model.firstWeightKg) {
        return model.firstWeightPrice;
      }
      const additionalWeight = Math.ceil(weight - model.firstWeightKg);
      return model.firstWeightPrice + additionalWeight * model.additionalWeightPricePerKg;

    case 'tiered_minimum_charge':
      if (!model.tiers || !model.minimumCharge) return -1;
      
      // 根据重量确定使用哪个价格区间
      let selectedTier = null;
      
      for (const tier of model.tiers) {
        if (tier.upToKg === null || weight <= tier.upToKg) {
          selectedTier = tier;
          break;
        }
      }
      
      if (!selectedTier) return -1;
      
      let price = 0;
      if (selectedTier.flatPrice) {
        price = selectedTier.flatPrice;
      } else if (selectedTier.pricePerKg) {
        price = weight * selectedTier.pricePerKg;
      }
      
      return Math.max(price, model.minimumCharge);

    case 'complex_tiered':
      if (!model.tiers) return -1;
      
      // 找到适合的重量区间
      for (const tier of model.tiers) {
        // 如果重量在这个区间内，使用这个区间的价格
        if (tier.upToKg === null || weight <= tier.upToKg) {
          if (tier.flatPrice) {
            // 固定价格
            return applyRounding(tier.flatPrice, model.rounding);
          } else if (tier.pricePerKg) {
            // 按重量计算
            const price = tier.baseFee ? tier.baseFee + weight * tier.pricePerKg : weight * tier.pricePerKg;
            return applyRounding(price, model.rounding);
          }
        }
      }
      
      return -1; // 没有找到合适的区间

    case 'first_plus_tiered_flat_rate':
      if (!model.firstWeightPrice || !model.tiers) return -1;
      
      // 申通快递的特殊逻辑：
      // 1kg内：首重价格
      // 1.1kg开始：按区间价格
      
      // 如果重量小于等于首重，只收首重价格
      if (weight <= model.firstWeightKg) {
        return model.firstWeightPrice;
      }
      
      // 超过首重的部分，按固定价格分段计算
      // 这里的tiers是基于总重量的区间，不是基于超出部分的
      for (const tier of model.tiers) {
        if (tier.upToKg === null || weight <= tier.upToKg) {
          if (tier.flatPrice) {
            return tier.flatPrice; // 直接返回区间价格
          }
        }
      }
      
      // 如果超过了所有区间的上限，返回-1（表示不接受）
      return -1;

    default:
      throw new Error(`Unknown pricing model type: ${(model as any).type}`);
  }
}

/**
 * 格式化价格显示
 */
export function formatPrice(price: number, currency: string = 'CNY'): string {
  return `¥${price.toFixed(2)}`
}

/**
 * 获取价格差异百分比
 */
export function getPriceDifference(price1: number, price2: number): number {
  if (price2 === 0) return 0
  return ((price1 - price2) / price2) * 100
}