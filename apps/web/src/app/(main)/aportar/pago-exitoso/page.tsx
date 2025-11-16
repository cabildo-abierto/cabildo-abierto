"use client"
import Link from 'next/link';
import {BaseButton} from "@/components/utils/base/base-button";
import {PageCardMessage} from "@/components/aportar/page-card-message";
import {useEffect} from "react";
import {useSession} from "@/components/auth/use-session";



export default function Page(){
    const {refetch} = useSession()

    useEffect(() => {
        refetch() // refetcheamos para que aparezca la notificación de verificación si se acaba de verifiar
    }, [])

    return <PageCardMessage
        title={"¡Muchísimas gracias por tu aporte!"}
        className={"pt-12 pb-6"}
        content={<div className={"space-y-6 flex flex-col items-center"}>
            <div className="font-light text-base">
                El pago se registró correctamente.
            </div>
            <div>
                <Link href="/inicio">
                    <BaseButton
                        variant={"outlined"}
                        size={"small"}
                    >
                        Ir al inicio
                    </BaseButton>
                </Link>
            </div>
        </div>}
    />
}