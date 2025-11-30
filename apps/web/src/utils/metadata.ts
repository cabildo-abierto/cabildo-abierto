import {Metadata} from "next";

export const mainDescription = "Una plataforma para discutir en serio, hecha en Argentina."
const banner = 'https://www.cabildoabierto.ar/banners/99.jpg'


export type MetadataParams = {
    title: string
    description: string
    thumbnail?: string
}


export function createMetadata({title, description, thumbnail=banner}: MetadataParams): Metadata {
    return {
        title,
        description,
        icons: { icon: iconUrl },
        openGraph: {
            title,
            description,
            images: [
                {
                    url: thumbnail,
                    width: 1200,
                    height: 630,
                    alt: "Artículo",
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [thumbnail],
        },
    }
}


export const openGraphMetadata = {
    title: 'Cabildo Abierto',
    description: mainDescription,
    url: 'https://cabildoabierto.ar',
    images: [
        {
            url: banner,
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
    images: [banner]
}

export const iconUrl = "/logo.svg"

export const mainMetadata = {
    title: 'Cabildo Abierto',
    description: mainDescription,
    icons: {
        icon: iconUrl
    },
    openGraph: openGraphMetadata,
    twitter: twitterMetadata
}