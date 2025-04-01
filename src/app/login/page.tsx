import { Suspense } from 'react';
import { Login } from '../../components/auth/login';
import {Metadata} from "next";
import {mainMetadata, twitterMetadata} from "../../utils/metadata";



export async function generateMetadata(
    { searchParams }: {searchParams: Promise<{c: string}>}
): Promise<Metadata> {
    const { c } = await searchParams

    if(c){
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

    return <div className={"flex items-center justify-center"}>
        <Suspense>
            <Login/>
        </Suspense>
    </div>
}