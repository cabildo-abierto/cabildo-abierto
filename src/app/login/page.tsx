import {Metadata} from "next";
import {mainMetadata, twitterMetadata} from "@/utils/metadata";
import LoginPage from "@/components/auth/login-page";


export async function generateMetadata(
    { params, searchParams }: {params: Promise<any>, searchParams: Promise<{ [key: string]: string | string[] | undefined }>}
): Promise<Metadata> {
    const s = await searchParams

    if(s && s.c){
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


export default function Page() {
    return <LoginPage/>
}