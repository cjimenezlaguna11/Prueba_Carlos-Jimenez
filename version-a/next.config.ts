import type { NextConfig } from 'next'

const config: NextConfig = {
  poweredByHeader: false,
  turbopack: { root: process.cwd() },
  outputFileTracingRoot: process.cwd(),
  images: { localPatterns: [{ pathname: '/images/products/**', search: '' }] }
}

export default config
