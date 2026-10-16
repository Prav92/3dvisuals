import type { NextConfig } from 'next';
const config: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  allowedDevOrigins: ['127.0.0.1'],
};
export default config;
