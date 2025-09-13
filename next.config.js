/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/logistics-calculator' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/logistics-calculator' : '',
}

module.exports = nextConfig
