//const withBundleAnalyzer = require('@next/bundle-analyzer')({
//    enabled: process.env.ANALYZE === 'true',
//})

nextConfig = {
    output: "standalone",
    reactStrictMode: false,
    logging: {
        fetches: {
            fullUrl: true
        }
    },
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "*" }
        ],
    },
    allowedDevOrigins: [
        '127.0.0.1', '*.127.0.0.1', '192.168.0.10', '192.168.0.11', '192.168.0.34', '0.0.0.0'
    ],
    experimental: {
        optimizePackageImports: [
            '@atproto/lexicon',
            '@atproto/api',
            '@atproto/syntax',
            '@atproto/xrpc'
        ]
    },
}

//module.exports = withBundleAnalyzer(nextConfig)
module.exports = nextConfig