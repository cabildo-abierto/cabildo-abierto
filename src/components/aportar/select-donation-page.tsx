"use client"
import {cn} from "@/lib/utils";
import {Note} from "@/components/layout/utils/note";
import {IntegerInputPlusMinus} from "@/components/aportar/integer-input-plus-minus";
import StateButton from "@/components/layout/utils/state-button";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {post} from "@/utils/fetch";
import {useMonthlyValue} from "@/queries/getters/useFunding";
import {useState} from "react";
import {useSession} from "@/queries/getters/useSession";
import LoadingSpinner from "@/components/layout/base/loading-spinner";
import {WalletPage} from "@/components/aportar/wallet-page";
import {useSearchParams} from "next/navigation";

async function createPreference(amount: number, verification: boolean) {
    return post<{ amount: number, verification: boolean }, { id: string }>(
        "/donate/create-preference",
        {amount, verification}
    )
}


export const SelectDonationPage = () => {
    const {data: value, isLoading} = useMonthlyValue()
    const [preferenceId, setPreferenceId] = useState<undefined | string>()
    const params = useSearchParams()
    const {user} = useSession()
    const verification = params.get("verification") != null && (user.validation == null || user.validation == "none")
    const [amount, setAmount] = useState(verification ? 1 : 0)
    const {isMobile} = useLayoutConfig()

    if (isLoading) {
        return <div className={"py-16"}>
            <LoadingSpinner/>
        </div>
    }

    async function handleAmountChange(val) {
        if (val === '') {
            setAmount(0)
        } else if (Number.isInteger(+val)) {
            setAmount(val)
        }
    }

    async function onClickContinue() {
        const {data, error} = await createPreference(amount, verification)
        if (error) return {error}
        setPreferenceId(data.id)
        return {}
    }

    const maxAmount = 500000
    const minAmount = 1

    const validAmount = amount >= minAmount && amount <= maxAmount

    if (preferenceId) {
        return <WalletPage
            preferenceId={preferenceId}
            amount={amount}
            verification={verification}
        />
    }

    return <div
        className={cn("w-full p-4 panel-dark portal space-y-8 group mt-32 mb-16", isMobile && "w-auto mx-2 mt-0")}
    >
        <div className={"flex flex-col items-center space-y-8"}>
            <div className={"text-center font-light space-y-8"}>
                <p className={"font-medium"}>
                    Elegí un valor para tu aporte
                </p>
                {!verification && <Note>
                    ${value} cubren el uso de la plataforma de un usuario durante un mes.
                </Note>}
            </div>
            <div className="flex flex-col items-center w-full space-y-2">
                <IntegerInputPlusMinus value={amount} onChange={handleAmountChange} delta={value}/>
                {amount > maxAmount && <div className="flex justify-center text-[var(--text-light)] text-center">
                    Para donar más de ${maxAmount} contactate con nosotros.
                </div>}
            </div>
        </div>
        {verification && <Note>
            El aporte se va a usar para verificar tu cuenta con Mercado Pago, $1 (un peso) es suficiente. Si aportás más, lo que aportes se va a usar para financiar la plataforma y remunerar a los autores.
        </Note>}
        <div className="flex justify-end w-full">
            <StateButton
                disabled={!validAmount}
                handleClick={onClickContinue}
                variant={"outlined"}
            >
                Continuar
            </StateButton>
        </div>
    </div>
}