const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

nextConfig = {
    turbopack: {
        resolveAlias: {
            underscore: 'lodash',
        },
        resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.json'],
    },
    logging: {
        fetches: {
            fullUrl: true
        },
        
    },
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "**",
        },
      ],
    }
}

module.exports = withBundleAnalyzer(nextConfig)