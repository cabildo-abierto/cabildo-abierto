"use client"
import {useSession} from "@/queries/useSession";
import {useRouter} from "next/navigation";
import {LoadingScreen} from "../../../modules/ui-utils/src/loading-screen";
import {Login} from "@/components/auth/login";
import {useEffect} from "react";


export default function LoginPage() {
    const session = useSession()
    const router = useRouter()

    useEffect(() => {
        if(session.user){
            router.push("/inicio")
        }
    }, [session])

    if(session.isLoading || session.data) return <LoadingScreen/>

    return <div className={"flex items-center justify-center"}>
        <Login/>
    </div>
}