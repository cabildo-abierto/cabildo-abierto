"use client"
import {BackButton} from "../../../../../modules/ui-utils/src/back-button";
import {useState} from "react";
import {useMonthlyValue, useSession} from "@/queries/api";
import { post } from "@/utils/fetch";
import { Button } from "../../../../../modules/ui-utils/src/button";
import DonateIcon from "@/components/icons/donate-icon";
import { IntegerInputPlusMinus } from "@/components/aportar/integer-input-plus-minus";
import LoadingSpinner from "../../../../../modules/ui-utils/src/loading-spinner";
import StateButton from "../../../../../modules/ui-utils/src/state-button";
import {LuPartyPopper} from "react-icons/lu";
import {MPWallet} from "@/components/aportar/mp-wallet";


async function createPreference(quantity: number, value: number) {
    return post<{quantity: number, value: number}, {id: string}>("/donate/create-preference", {quantity, value})
}


export default function Page() {
    const {data: value, isLoading} = useMonthlyValue()
    const [quantity, setQuantity] = useState(1)
    const [preferenceId, setPreferenceId] = useState<undefined | string>()
    const amount = quantity * value

    if(isLoading) {
        return <div className={"py-16"}>
            <LoadingSpinner />
        </div>
    }

    async function handleAmountChange(val){
        if(val === ''){
            setQuantity(0)
        } else if(Number.isInteger(+val)){
            setQuantity(val)
        }
    }

    const maxAmount = 500000
    const minAmount = 1

    const validAmount = amount >= minAmount && amount <= maxAmount

    async function onClickContinue(){
        const {data, error} = await createPreference(quantity, value)
        if(error) return {error}
        setPreferenceId(data.id)
        return {}
    }

    if(preferenceId){
        return <div className={"pt-48"}>
            <MPWallet preferenceId={preferenceId}/>
        </div>
    } else {
        return <div className={"pt-2"}>
            <BackButton defaultURL={"/aportar"} preferReferrer={true}/>

            <div className={"flex justify-center"}>
                <div className={"flex flex-col items-center space-y-4 bg-[var(--background-dark)] rounded-lg p-8 mt-8 sm:w-full sm:max-w-[400px] w-screen"}>
                    <div className={"text-[var(--text-light)] text-lg"}>
                        <LuPartyPopper fontSize={"22px"}/>
                    </div>

                    <div className={"text-center text-[var(--text-light)]"}>
                        <p>
                            Elegí una cantidad de suscripciones a aportar.
                        </p>
                        <p>
                            Cada suscripción representa un mes de uso de un usuario y tiene un valor de ${value}.
                        </p>
                    </div>
                    <div className="flex flex-col items-center w-full space-y-2 py-4">
                        <IntegerInputPlusMinus value={quantity} onChange={handleAmountChange} delta={1}/>

                        {amount > maxAmount && <div className="flex justify-center text-[var(--text-light)] text-center">
                            Para donar más de ${maxAmount} contactate con nosotros.
                        </div>}
                    </div>
                    <div className={"flex flex-col items-center pb-4"}>
                        <div className={"text-[var(--text-light)]"}>
                            Aporte
                        </div>
                        <div className={"text-lg"}>
                            ${amount}
                        </div>
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