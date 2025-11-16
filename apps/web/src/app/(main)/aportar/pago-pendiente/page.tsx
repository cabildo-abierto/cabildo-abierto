"use client"
import {PageCardMessage} from "@/components/aportar/page-card-message";
import Link from "next/link";
import {BaseButton} from "@/components/utils/base/base-button";


export default function Page(){
    return <PageCardMessage
        className={"pb-6 pt-8 px-12"}
        title={"Aporte pendiente"}
        content={<div className={"space-y-6 flex flex-col items-center"}>
            <div className={"font-light text-center"}>
                El pago quedó pendiente. Si podés, revisá cómo te figura en tu medio de pago. Ante cualquier duda, escribinos.
            </div>
            <div>
                <Link href="/aportar">
                    <BaseButton
                        size="small"
                        variant={"outlined"}
                    >
                        Ir a mis aportes
                    </BaseButton>
                </Link>
            </div>
        </div>}
    />
}