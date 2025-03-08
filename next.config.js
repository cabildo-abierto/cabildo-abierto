const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

nextConfig = {
    experimental: {
        turbo: {
            // ...
        },
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