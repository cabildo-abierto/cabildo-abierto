"use client"
import {useState} from "react";
import {useMonthlyValue} from "@/queries/getters/useFunding";
import {post} from "@/utils/fetch";
import {IntegerInputPlusMinus} from "@/components/aportar/integer-input-plus-minus";
import LoadingSpinner from "../../../../components/layout/base/loading-spinner";
import StateButton from "../../../../components/layout/utils/state-button";
import {MPWallet} from "@/components/aportar/mp-wallet";


async function createPreference(amount: number) {
    return post<{ amount: number }, { id: string }>("/donate/create-preference", {amount})
}


export default function Page() {
    const {data: value, isLoading} = useMonthlyValue()
    const [amount, setAmount] = useState(0)
    const [preferenceId, setPreferenceId] = useState<undefined | string>()

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

    const maxAmount = 500000
    const minAmount = 1

    const validAmount = amount >= minAmount && amount <= maxAmount

    async function onClickContinue() {
        const {data, error} = await createPreference(amount)
        if (error) return {error}
        setPreferenceId(data.id)
        return {}
    }

    if (preferenceId) {
        return <div className={"p-16 font-light panel-dark mt-4 flex flex-col items-center space-y-8"}>
            <div className={"text-center"}>
                Aportando ${amount}.
            </div>
            <MPWallet preferenceId={preferenceId}/>
        </div>
    } else {
        return <div className={"w-full p-4 panel-dark portal space-y-8 group mt-32"}>
            <div className={"flex flex-col items-center space-y-8"}>
                <div className={"text-center font-light space-y-8"}>
                    <p className={"font-medium"}>
                        Elegí un valor para tu aporte
                    </p>
                    <p className={"text-[var(--text-light)] text-sm"}>
                        ${value} cubren el uso de la plataforma de un usuario durante un mes.
                    </p>
                </div>
                <div className="flex flex-col items-center w-full space-y-2">
                    <IntegerInputPlusMinus value={amount} onChange={handleAmountChange} delta={value}/>
                    {amount > maxAmount && <div className="flex justify-center text-[var(--text-light)] text-center">
                        Para donar más de ${maxAmount} contactate con nosotros.
                    </div>}
                </div>
            </div>
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
}