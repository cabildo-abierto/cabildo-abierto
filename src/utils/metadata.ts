import { produce } from "immer"


export type MetadataParams = {
    title: string
    description: string
    thumbnail: string
}


export function createMetadata(m: MetadataParams){
    return produce(mainMetadata, draft => {
        draft.title = m.title
        draft.description = m.description
        draft.icons.icon = iconUrl
        draft.openGraph.title = m.title
        draft.openGraph.description = m.description
        draft.twitter.title = m.title
        draft.twitter.description = m.description
    })
}

export const mainDescription = "Una plataforma para discutir en serio, hecha en Argentina."
const banner = 'https://www.cabildoabierto.ar/banners/99.jpg'

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