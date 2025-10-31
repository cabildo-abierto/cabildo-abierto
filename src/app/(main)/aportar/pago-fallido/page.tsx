"use client"
import Link from 'next/link';

import {BaseButton} from "@/components/layout/base/baseButton";
import {PageCardMessage} from "@/components/aportar/page-card-message";


export default function Page() {
    return <PageCardMessage
        className={"pb-6 pt-8 px-12"}
        title={"Error en el pago"}
        content={<div className={"space-y-6 flex flex-col items-center"}>
            <div className={"font-light text-center"}>
                Ocurrió un error al procesar tu aporte. Volvé a intentar o escribinos si sigue fallando.
            </div>
            <div>
                <Link href="/aportar">
                    <BaseButton
                        size="small"
                        variant={"outlined"}
                    >
                        Volver a intentar
                    </BaseButton>
                </Link>
            </div>
        </div>}
    />
}