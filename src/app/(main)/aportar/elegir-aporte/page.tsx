"use client"
import {BackButton} from "../../../../../modules/ui-utils/src/back-button";
import {useState} from "react";
import {useMonthlyValue} from "@/queries/api";
import { post } from "@/utils/fetch";
import { IntegerInputPlusMinus } from "@/components/aportar/integer-input-plus-minus";
import LoadingSpinner from "../../../../../modules/ui-utils/src/loading-spinner";
import StateButton from "../../../../../modules/ui-utils/src/state-button";
import {LuPartyPopper} from "react-icons/lu";
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
        return <div className={"pt-2"}>
            <BackButton defaultURL={"/aportar"} preferReferrer={true}/>

            <div className={"flex justify-center"}>
                <div className={"flex flex-col items-center space-y-4 bg-[var(--background-dark)] rounded-lg p-8 mt-8 sm:w-full sm:max-w-[400px] w-screen"}>
                    <div className={"w-full"}>
                        <BackButton onClick={() => {setPreferenceId(undefined)}} color={"background-dark"}/>
                    </div>
                    <div className={"text-center"}>
                        Aportando ${amount}.
                    </div>
                    <MPWallet preferenceId={preferenceId}/>
                </div>
            </div>
        </div>
    } else {
        return <div className={"pt-2"}>
            <BackButton defaultURL={"/aportar"} preferReferrer={true}/>

            <div className={"flex justify-center"}>
                <div className={"flex flex-col items-center space-y-4 bg-[var(--background-dark)] rounded-lg p-8 mt-8 sm:w-full sm:max-w-[400px] w-screen"}>
                    <div className={"text-[var(--text-light)] text-lg"}>
                        <LuPartyPopper fontSize={"22px"}/>
                    </div>

                    <div className={"text-center space-y-2"}>
                        <p>
                            Elegí un valor para tu aporte.
                        </p>
                        <p className={"text-sm text-[var(--text-light)]"}>
                            ${value} cubren el uso de la plataforma de un usuario durante un mes.
                        </p>
                    </div>
                    <div className="flex flex-col items-center w-full space-y-2 py-4">
                        <IntegerInputPlusMinus value={amount} onChange={handleAmountChange} delta={1200}/>

                        {amount > maxAmount && <div className="flex justify-center text-[var(--text-light)] text-center">
                            Para donar más de ${maxAmount} contactate con nosotros.
                        </div>}
                    </div>
                    <div className="flex justify-center space-x-4">
                        <StateButton
                            disabled={!validAmount}
                            handleClick={onClickContinue}
                            text1={"Continuar"}
                            textClassName={"font-semibold"}
                        />
                    </div>
                </div>
            </div>
        </div>
    }
}