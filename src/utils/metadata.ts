

export const mainDescription = "Una plataforma para la discusión pública argentina."

export const openGraphMetadata = {
    title: 'Cabildo Abierto',
    description: mainDescription,
    url: 'https://cabildoabierto.com.ar',
    images: [
        {
            url: 'https://cabildoabierto.com.ar/logo.png',
            width: 1200,
            height: 630,
            alt: 'Cabildo Abierto'
        },
    ],
    siteName: 'Cabildo Abierto',
}

export const twitterMetadata = {
    card: 'summary_large_image',
    title: 'Cabildo Abierto',
    description: mainDescription,
    images: ['https://cabildoabierto.com.ar/logo.png']
}

export const mainMetadata = {
    title: 'Cabildo Abierto',
    description: mainDescription,
    icons: {
        icon: "/logo.svg"
    },
    openGraph: openGraphMetadata,
    twitter: twitterMetadata
}