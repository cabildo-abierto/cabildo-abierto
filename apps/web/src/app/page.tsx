"use client"
import {useSession} from "@/components/auth/use-session";
import {useRouter} from "next/navigation";
import {LoadingScreen} from "@/components/utils/loading-screen";
import {useEffect} from "react";


export default function Page() {
    const {user, isLoading} = useSession()
    const router = useRouter()

    useEffect(() => {
        if(isLoading) {
        } else if(user) {
            router.push("/inicio")
        } else {
            router.push("/presentacion")
        }
    }, [user, isLoading]);

    return <LoadingScreen/>
}