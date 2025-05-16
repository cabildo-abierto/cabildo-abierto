"use client"
import { Login } from '@/components/auth/login';
import {Metadata} from "next";
import {mainMetadata, twitterMetadata} from "@/utils/metadata";
import {useSession} from "@/queries/api";
import {useRouter} from "next/navigation";
import {LoadingScreen} from "../../../modules/ui-utils/src/loading-screen";
import {useEffect} from "react";


export default function Page() {
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