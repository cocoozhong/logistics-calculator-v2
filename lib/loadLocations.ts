// lib/loadLocations.ts

export interface Location {
  id: string;
  name: string;
  pricingRules?: string[]; // 关联的计价规则ID
}

export async function getLocations(): Promise<Location[]> {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    throw new Error('Airtable credentials are not set in .env.local');
  }

  // 获取所有地点记录（处理分页）
  const allRecords: any[] = [];
  let offset: string | undefined = undefined;
  let totalFetched = 0;

  do {
    const url: string = offset 
      ? `https://api.airtable.com/v0/${baseId}/地点?offset=${offset}`
      : `https://api.airtable.com/v0/${baseId}/地点`;

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
      next: { revalidate: 0 } // 开发时设为0不缓存，方便调试
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch location data from Airtable: ${errorText}`);
    }

    const data = await response.json();
    allRecords.push(...data.records);
    totalFetched += data.records.length;
    offset = data.offset;
    
    console.log(`Fetched ${data.records.length} location records, total: ${totalFetched}`);
  } while (offset);

  console.log(`Total location records fetched from Airtable: ${allRecords.length}`);
  
  const locations = allRecords.map((record: any): Location => {
    const fields = record.fields;

    return {
      id: record.id,
      name: fields.地点名 || '未命名地点',
      pricingRules: fields.计价规则 || []
    };
  });

  // 过滤掉无效的地点
  const validLocations = locations.filter((location: Location) => {
    return location.name && location.name !== '未命名地点';
  });

  console.log(`Loaded ${validLocations.length} valid locations out of ${locations.length} total locations`);
  return validLocations;
}
