import type {Metadata} from "next";

export const siteName = "Cabildo Abierto";
export const siteDescription = "Un espacio de discusión argentino para conectar con otros y construir conocimiento colectivo.";
export const siteUrl = process.env.NEXT_PUBLIC_FRONTEND_URL ?? "https://cabildoabierto.ar";
const socialImage = "/banners/99.jpg";

export function createMetadata({
    title,
    description = siteDescription,
    index = true,
}: {
    title: string
    description?: string
    index?: boolean
}): Metadata {
    return {
        title,
        description,
        robots: index ? undefined : {index: false, follow: false},
        openGraph: {
            type: "website",
            locale: "es_AR",
            siteName,
            title,
            description,
            images: [{url: socialImage, width: 1200, height: 630, alt: siteName}],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [socialImage],
        },
    };
}

export const rootMetadata: Metadata = {
    metadataBase: new URL(siteUrl),
    applicationName: siteName,
    title: {
        default: siteName,
        template: `%s | ${siteName}`,
    },
    description: siteDescription,
    icons: {icon: "/icon.svg"},
    openGraph: {
        type: "website",
        locale: "es_AR",
        siteName,
        title: siteName,
        description: siteDescription,
        url: "/",
        images: [{url: socialImage, width: 1200, height: 630, alt: siteName}],
    },
    twitter: {
        card: "summary_large_image",
        title: siteName,
        description: siteDescription,
        images: [socialImage],
    },
};
