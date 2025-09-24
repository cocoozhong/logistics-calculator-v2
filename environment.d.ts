// environment.d.ts
namespace NodeJS {
  interface ProcessEnv {
    // 在这里添加你自定义的环境变量
    // 并告诉 TypeScript 它们是字符串类型
    AIRTABLE_API_KEY: string;
    AIRTABLE_BASE_ID: string;
    AIRTABLE_TABLE_NAME: string;
  }
}