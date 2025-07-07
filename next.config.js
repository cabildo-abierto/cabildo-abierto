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
    allowedDevOrigins: ['127.0.0.1', '*.127.0.0.1', '192.168.0.10', '192.168.0.11'],
    experimental: {
        optimizePackageImports: ['@mui/material', '@mui/icons-material', '@mui', 'react-icons'],
    },
}

module.exports = withBundleAnalyzer(nextConfig)
//module.exports = nextConfig