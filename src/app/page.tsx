"use client"
import {useSession} from "@/queries/getters/useSession";
import {useRouter} from "next/navigation";
import {LoadingScreen} from "../components/layout/utils/loading-screen";
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