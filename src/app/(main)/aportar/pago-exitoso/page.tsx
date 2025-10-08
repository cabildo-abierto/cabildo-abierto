"use client"
import Link from 'next/link';
import {Button} from "../../../../../modules/ui-utils/src/button";
import {PageCardMessage} from "@/components/aportar/page-card-message";



export default function Page(){
    return <PageCardMessage
        title={"¡Muchísimas gracias por tu aporte!"}
        className={"pt-12 pb-6"}
        content={<div className={"space-y-6 flex flex-col items-center"}>
            <div className="font-light text-base">
                El pago se registró correctamente.
            </div>
            <div>
                <Link href="/inicio">
                    <Button variant={"outlined"} color={"background-dark2"} size={"small"}>
                        Ir al inicio
                    </Button>
                </Link>
            </div>
        </div>}
    />
}