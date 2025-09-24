/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true
  },
  // 禁用服务端功能以支持静态导出
  experimental: {
    esmExternals: false
  }
}

module.exports = nextConfig
