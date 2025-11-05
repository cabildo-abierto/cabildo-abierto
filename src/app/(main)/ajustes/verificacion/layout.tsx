"use client"
import {ReactNode, useEffect, useState} from "react";
import {useCurrentValidationRequest} from "@/queries/getters/useValidation";
import LoadingSpinner from "@/components/layout/base/loading-spinner";
import {usePathname, useRouter} from "next/navigation";


export default function Layout({children}: {
    children: ReactNode
}) {
    const {data: curRequest, isLoading} = useCurrentValidationRequest()
    const pathname = usePathname()
    const router = useRouter()
    const [validPath, setValidPath] = useState(false)

    useEffect(() => {
        if(curRequest) {
            if(pathname.startsWith("/ajustes/verificacion/verificar/") && curRequest.result != "Rechazada"){
                router.push("/ajustes/verificacion")
            } else {
                setValidPath(true)
            }
        } else {
            if(pathname == "/ajustes/verificacion") {
                router.push("/ajustes/verificacion/verificar")
            } else {
                setValidPath(true)
            }
        }
    }, [curRequest])

    if(isLoading || !validPath) {
        return <div className={"pt-32"}>
            <LoadingSpinner/>
        </div>
    }


    return <>
        {children}
    </>
}