// lib/loadPrices.ts
import { PriceRule } from '@/types/pricing';

export async function getPriceRules(): Promise<PriceRule[]> {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_NAME;

  if (!apiKey || !baseId || !tableName) {
    throw new Error('Airtable credentials are not set in .env.local');
  }

  // 获取所有记录（处理分页）
  const allRecords: any[] = [];
  let offset: string | undefined = undefined;
  let totalFetched = 0;

  do {
    const url: string = offset 
      ? `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?offset=${offset}`
      : `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
      next: { revalidate: 0 } // 开发时设为0不缓存，方便调试
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch data from Airtable: ${errorText}`);
    }

    const data = await response.json();
    allRecords.push(...data.records);
    totalFetched += data.records.length;
    offset = data.offset;
    
    console.log(`Fetched ${data.records.length} records, total: ${totalFetched}`);
  } while (offset);

  console.log(`Total records fetched from Airtable: ${allRecords.length}`);
  
  const rules = allRecords.map((record: any): PriceRule => {
    const fields = record.fields;

    // 调试信息
    console.log(`Processing rule: ${fields.规则名称 || fields.RuleName || 'Untitled'}`);

    let parsedTiers: any[] = [];
    if (fields.Tiers && typeof fields.Tiers === 'string') {
      try {
        parsedTiers = JSON.parse(fields.Tiers);
        console.log(`Successfully parsed Tiers for ${fields.规则名称 || fields.RuleName}:`, parsedTiers);
      } catch (e) {
        console.error(`Error parsing Tiers JSON for rule: ${fields.规则名称 || fields.RuleName || 'Untitled'}`, fields.Tiers, e);
      }
    }

    return {
      RuleName: fields.规则名称 || fields.RuleName,
      Company: fields.物流公司,
      CompanyName: fields.CompanyName || fields.物流公司,
      Client: fields.所属客户,
      Destination: fields.目的地,
      ModelType: fields.ModelType,
      MinimumCharge: fields.MinimumCharge,
      FirstWeightPrice: fields.FirstWeightPrice,
      FirstWeightKg: fields.FirstWeightKg,
      AdditionalWeightPricePerKg: fields.AdditionalWeightPricePerKg,
      Tiers: parsedTiers,
      Timeliness: fields.Timeliness,
      ExceptionThresholdKg: fields.ExceptionThresholdKg,
      ExceptionFormula: fields.ExceptionFormula,
    };
  });

  // 过滤掉无效的规则
  const validRules = rules.filter((rule: PriceRule) => {
    // 必须有规则名称
    if (!rule.RuleName) {
      console.warn('Skipping rule without name:', rule);
      return false;
    }
    
    // 必须有计价模型类型
    if (!rule.ModelType) {
      console.warn(`Skipping rule ${rule.RuleName} without ModelType:`, rule);
      return false;
    }
    
    // 根据模型类型验证必要字段
    if (rule.ModelType === 'first_additional') {
      if (!rule.FirstWeightPrice || !rule.AdditionalWeightPricePerKg) {
        console.warn(`Skipping rule ${rule.RuleName} with invalid first_additional fields:`, rule);
        return false;
      }
    } else if (rule.ModelType === 'tiered_minimum_charge') {
      if (!rule.MinimumCharge || !rule.Tiers || rule.Tiers.length === 0) {
        console.warn(`Skipping rule ${rule.RuleName} with invalid tiered_minimum_charge fields:`, rule);
        return false;
      }
    } else if (rule.ModelType === 'complex_tiered') {
      if (!rule.Tiers || rule.Tiers.length === 0) {
        console.warn(`Skipping rule ${rule.RuleName} with invalid complex_tiered fields:`, rule);
        return false;
      }
    }
    
    return true;
  });

  console.log(`Loaded ${validRules.length} valid rules out of ${rules.length} total rules`);
  return validRules;
}