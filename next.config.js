const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

nextConfig = {
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
    },
}

module.exports = withBundleAnalyzer(nextConfig)