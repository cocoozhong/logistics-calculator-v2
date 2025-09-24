// 简单测试 Airtable 连接
async function testAirtable() {
  // 从 .env.local 文件中读取配置
  const fs = require('fs');
  
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim().replace(/"/g, '');
      }
    });

    const apiKey = envVars.AIRTABLE_API_KEY;
    const baseId = envVars.AIRTABLE_BASE_ID;
    const tableName = envVars.AIRTABLE_TABLE_NAME;

    console.log('环境变量检查:');
    console.log('API Key:', apiKey ? '已设置 (长度: ' + apiKey.length + ')' : '未设置');
    console.log('Base ID:', baseId ? '已设置 (' + baseId + ')' : '未设置');
    console.log('Table Name:', tableName ? '已设置 (' + tableName + ')' : '未设置');
    console.log('');

    if (!apiKey || !baseId || !tableName) {
      console.error('环境变量未完全设置');
      return;
    }

    console.log('正在连接 Airtable...');
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        }
      }
    );

    console.log('HTTP 状态码:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ 成功连接 Airtable!');
    console.log('📊 获取到记录数量:', data.records.length);
    console.log('');

    if (data.records.length > 0) {
      console.log('📋 记录详情:');
      data.records.forEach((record, index) => {
        console.log(`\n记录 ${index + 1}:`);
        console.log('  ID:', record.id);
        console.log('  字段数量:', Object.keys(record.fields).length);
        console.log('  字段列表:', Object.keys(record.fields).join(', '));
        
        // 显示关键字段
        const fields = record.fields;
        if (fields.规则名称) console.log('  规则名称:', fields.规则名称);
        if (fields.物流公司) console.log('  物流公司:', fields.物流公司);
        if (fields.CompanyName) console.log('  CompanyName:', fields.CompanyName);
        if (fields.目的地) console.log('  目的地:', fields.目的地);
        if (fields.ModelType) console.log('  ModelType:', fields.ModelType);
      });
    } else {
      console.log('⚠️  表格中没有数据记录');
    }

  } catch (error) {
    console.error('❌ 连接失败:', error.message);
  }
}

testAirtable();
