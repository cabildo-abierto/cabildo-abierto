"use client"
import {Note} from "@/components/layout/utils/note";
import {useDonationHistory} from "@/queries/getters/useFunding";
import LoadingSpinner from "@/components/layout/base/loading-spinner";
import Link from "next/link";
import {BaseButton} from "@/components/layout/base/baseButton";
import {Paragraph} from "@/components/layout/base/paragraph";
import StateButton from "@/components/layout/utils/state-button";
import {post} from "@/utils/fetch";


async function attemptMPVerification() {
    return await post("/attempt-mp-verification")
}


export default function Page() {
    let {data, isLoading} = useDonationHistory()

    if (isLoading) return <div>
        <LoadingSpinner/>
    </div>

    if (data && data.length > 0) {
        return <div className={"space-y-4"}>
            <div>
                <Paragraph className={"font-medium"}>
                    Ya hiciste {data.length > 1 ? "aportes" : "un aporte"} con Mercado Pago, podés {data.length > 1 ? "usarlos" : "usarlo"} para verificar tu cuenta.
                </Paragraph>
                <Note className={"text-left text-[var(--text-light)]"}>
                    La verificación es inmediata.
                </Note>
            </div>
            <div className={"flex justify-center"}>
                <StateButton
                    variant={"outlined"}
                    handleClick={async () => {
                        return await attemptMPVerification()
                    }}
                >
                    Verificar mi cuenta personal
                </StateButton>
            </div>
        </div>
    }

    return <div className={"space-y-6"}>
        <div>
            <Paragraph className={"text-left font-medium"}>
                Podés verificar tu cuenta con Mercado Pago haciendo un aporte.
            </Paragraph>
            <Note className={"text-left text-[var(--text-light)]"}>
                $1 es suficiente.
            </Note>
        </div>

        <div className={"flex justify-center"}>
            <Link href={"/aportar/elegir-aporte?verificacion=true"}>
                <BaseButton variant={"outlined"}>
                    Continuar
                </BaseButton>
            </Link>
        </div>
    </div>
}