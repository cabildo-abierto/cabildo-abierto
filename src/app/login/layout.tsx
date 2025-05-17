import {Metadata} from "next";
import {mainMetadata, twitterMetadata} from "@/utils/metadata";

export async function generateMetadata(
    { searchParams }: {searchParams: Promise<{c: string}>}
): Promise<Metadata> {
    const params = await searchParams

    if(params && params.c){
        return {
            ...mainMetadata,
            title: "¡Sumate a Cabildo Abierto!",
            openGraph: {
                ...mainMetadata.openGraph,
                title: "¡Sumate a Cabildo Abierto!"
            },
            twitter: {
                ...twitterMetadata,
                title: "¡Sumate a Cabildo Abierto!"
            }
        }
    } else {
        return mainMetadata
    }
}


export default async function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
    return <>{children}</>
}