/*const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})*/

nextConfig = {
    webpack: (config) => {
        config.resolve.extensionAlias = {
            ".js": [".ts", ".tsx", ".js"],
        };

        return config;
    },
    logging: {
        fetches: {
            fullUrl: true
        }
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

//module.exports = withBundleAnalyzer(nextConfig)
module.exports = nextConfig