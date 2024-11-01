
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

module.exports = nextConfig