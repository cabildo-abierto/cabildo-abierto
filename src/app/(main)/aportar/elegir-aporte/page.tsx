"use client"
import {useState} from "react";
import {useMonthlyValue} from "@/queries/getters/useFunding";
import { post } from "@/utils/fetch";
import { IntegerInputPlusMinus } from "@/components/aportar/integer-input-plus-minus";
import LoadingSpinner from "../../../../../modules/ui-utils/src/loading-spinner";
import StateButton from "../../../../../modules/ui-utils/src/state-button";
import {MPWallet} from "@/components/aportar/mp-wallet";


async function createPreference(amount: number) {
    return post<{amount: number}, {id: string}>("/donate/create-preference", {amount})
}


export default function Page() {
    const {data: value, isLoading} = useMonthlyValue()
    const [amount, setAmount] = useState(0)
    const [preferenceId, setPreferenceId] = useState<undefined | string>()

    if(isLoading) {
        return <div className={"py-16"}>
            <LoadingSpinner />
        </div>
    }

    async function handleAmountChange(val){
        if(val === ''){
            setAmount(0)
        } else if(Number.isInteger(+val)){
            setAmount(val)
        }
    }

    const maxAmount = 500000
    const minAmount = 1

    const validAmount = amount >= minAmount && amount <= maxAmount

    async function onClickContinue(){
        const {data, error} = await createPreference(amount)
        if(error) return {error}
        setPreferenceId(data.id)
        return {}
    }

    if(preferenceId){
        return <div className={"p-16 font-light rounded-panel-dark mt-4 flex flex-col items-center space-y-8"}>
            <div className={"text-center"}>
                Aportando ${amount}.
            </div>
            <MPWallet preferenceId={preferenceId}/>
        </div>
    } else {
        return <div className={"pt-2 w-full h-full rounded-panel-dark mt-4"}>
            <div className={"flex justify-center mx-2"}>
                <div className={"flex flex-col items-center space-y-4 p-4 mt-8 sm:w-full sm:max-w-[400px] w-screen"}>
                    <div className={"text-center font-light space-y-2"}>
                        <p className={"text-lg"}>
                            Elegí un valor para tu aporte
                        </p>
                        <p className={"text-[var(--text-light)]"}>
                            ${value} cubren el uso de la plataforma de un usuario durante un mes.
                        </p>
                    </div>
                    <div className="flex flex-col items-center w-full space-y-2 py-4">
                        <IntegerInputPlusMinus value={amount} onChange={handleAmountChange} delta={value}/>
                        {amount > maxAmount && <div className="flex justify-center text-[var(--text-light)] text-center">
                            Para donar más de ${maxAmount} contactate con nosotros.
                        </div>}
                    </div>
                    <div className="flex justify-center w-full">
                        <StateButton
                            disabled={!validAmount}
                            handleClick={onClickContinue}
                            text1={"Continuar"}
                            variant={"text"}
                            paddingY={"8px"}
                            paddingX={"16px"}
                            textClassName={"text-[15px]"}
                            sx={{borderRadius: "4px"}}
                            color={"background-dark2"}
                        />
                    </div>
                </div>
            </div>
        </div>
    }
}