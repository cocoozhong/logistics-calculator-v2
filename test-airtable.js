// 测试 Airtable 连接
require('dotenv').config({ path: '.env.local' });

async function testAirtable() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_NAME;

  console.log('环境变量检查:');
  console.log('API Key:', apiKey ? '已设置' : '未设置');
  console.log('Base ID:', baseId ? '已设置' : '未设置');
  console.log('Table Name:', tableName ? '已设置' : '未设置');
  console.log('');

  if (!apiKey || !baseId || !tableName) {
    console.error('环境变量未完全设置');
    return;
  }

  try {
    console.log('正在连接 Airtable...');
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('成功连接 Airtable!');
    console.log('获取到记录数量:', data.records.length);
    console.log('');

    if (data.records.length > 0) {
      console.log('前几条记录:');
      data.records.slice(0, 3).forEach((record, index) => {
        console.log(`记录 ${index + 1}:`);
        console.log('  ID:', record.id);
        console.log('  字段:', Object.keys(record.fields));
        console.log('  数据:', record.fields);
        console.log('');
      });
    } else {
      console.log('表格中没有数据记录');
    }

  } catch (error) {
    console.error('连接失败:', error.message);
  }
}

testAirtable();
