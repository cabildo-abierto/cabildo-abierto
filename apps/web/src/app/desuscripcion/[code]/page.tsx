"use client"
import React, {useEffect, useState} from "react";
import {post} from "@/components/utils/react/fetch";
import {Logo} from "@/components/utils/icons/logo";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {cn} from "@/lib/utils";


export default function Page({params}: {
    params: Promise<{
        code: string
    }>
}) {
    const {code} = React.use(params)
    const [state, setState] = useState<"not-started" | "loading" | "done" | "error">("not-started")

    useEffect(() => {
        async function unsuscribe() {
            setState("loading")
            const {error} = await post(`/unsubscribe/${code}`)
            if (!error) {
                setState("done")
            } else {
                setState("error")
            }
        }

        if (!code) {
            if (state != "error") {
                setState("error")
            }
        } else if (state == "not-started") {
            unsuscribe()
        }
    }, [state, code])

    const textClassName = "normal-case max-w-64 text-center font-light"

    return <div className={"flex flex-col items-center space-y-4 justify-center pt-32"}>
        <Logo width={48} height={48}/>
        {state == "done" && <div className={textClassName}>
            Se te eliminó de la lista de correos.
        </div>}
        {state == "loading" && <div className={cn(textClassName, "space-y-3")}>
            <div>
                Te estamos borrando de la lista de correos.
            </div>
            <LoadingSpinner/>
        </div>}
        {state == "error" && <div className={textClassName}>
            <p>
                Ocurrió un error al borrarte de la lista de correos.
            </p>
            <p>
                Sentimos las molestias, contactá a soporte@cabildoabierto.ar para solicitar la eliminación.
            </p>
        </div>}
    </div>
}