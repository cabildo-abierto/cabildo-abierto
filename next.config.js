const path = require('path')

/*const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
})*/

nextConfig = {
    /*experimental: {
        optimizePackageImports: ['icon-library'],
    },*/
    logging: {
        fetches: {
            fullUrl: true
        },
        
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
        // Ensure that all imports of 'yjs' resolve to the same instance
        config.resolve.alias['yjs'] = path.resolve(__dirname, 'node_modules/yjs')
        }
        return config
    },
}

module.exports = nextConfig