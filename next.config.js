const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
})

nextConfig = {
    reactStrictMode: false,
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
    },
    allowedDevOrigins: ['127.0.0.1', '*.127.0.0.1', '192.168.0.10', '192.168.0.11', '192.168.0.34'],
    experimental: {
        optimizePackageImports: [
            '@mui/material',
            '@mui/icons-material',
            '@mui',
            'react-icons',
            '@atproto/lexicon',
            '@atproto/api',
            '@atproto/syntax',
            '@atproto/xrpc'
        ],
        esmExternals: true
    },
}

module.exports = withBundleAnalyzer(nextConfig)
//module.exports = nextConfig