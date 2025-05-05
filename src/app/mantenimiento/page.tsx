"use client"


import { useEffect } from "react";
import {Logo} from "../../../modules/ui-utils/src/logo";
import {useSession} from "@/hooks/api";
import {useRouter} from "next/navigation";

const Page = () => {
    const session = useSession()
    const router = useRouter()

    useEffect(() => {
        if(!session.isLoading && !session.error){
            router.push("/inicio")
        }
    }, [router, session])

    return <div className={"h-screen flex flex-col justify-between lg:px-16"}>
        <div className={"flex flex-col items-center justify-center h-full space-y-4"}>
            <Logo/>
            <h2>
                Ocurrió un error en la conexión con el servidor...
            </h2>
            <div className={"text-[var(--text-light)] text-lg"}>
                Intentá de nuevo más tarde
            </div>
        </div>
    </div>
}


export default Page