"use client"
import LoadingSpinner from './loading-spinner';
import { useDonationsDistribution, useFundingPercentage, useSubscriptionPrice } from '../app/hooks/subscriptions';
import Link from 'next/link';
import { ThreeColumnsLayout } from './three-columns';
import { useUser } from '../app/hooks/user';
import { UserProps } from '../app/lib/definitions';
import { nextSubscriptionEnd } from './utils';
import FundingProgress from './funding-progress';
import StateButton from './state-button';
import { ArrowRightIcon, DonateIcon, ExpandLessIcon, ExpandMoreIcon } from './icons';
import { Desplegable } from './desplegable';
import { useState } from 'react';
import { createPreference } from '../actions/payments';
import { IntegerInputPlusMinus } from './integer-input-plus-minus';
import { UniqueDonationCheckout } from './unique-donation-checkout';
import InfoPanel from './info-panel';
import { Button } from '@mui/material';


const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]


function dateToText(date: Date){
    return date.getDate() + " de " + meses[date.getMonth()] + " de " + date.getFullYear()
}


function getSubscriptionEndDate(user: UserProps){
    const extraMonths = user.subscriptionsBought.length
    const nextEnd = nextSubscriptionEnd(user, extraMonths)
    return dateToText(nextEnd)
}


const HowUsed = () => {
    const {price} = useSubscriptionPrice()

    const howUsedText = <div className="text-sm sm:text-base flex flex-col justify-center mt-4 lg:w-96 w-64 link space-y-2 rounded-xl bg-[var(--secondary-light)] p-4">
        <div className="space-y-2 text-gray-800">
            <div className="flex items-start">
                <span className="mr-2 text-primary"><ArrowRightIcon/></span>
                <p>Los aportes voluntarios son el único medio de financiamiento de la plataforma.</p>
            </div>
            
            <div className="flex items-start">
                <span className="mr-2 text-primary"><ArrowRightIcon/></span>
                <p>El 70% de cada aporte se reparte entre los autores de publicaciones y contenidos de temas (vos también podés ser autor/a).</p>
            </div>
            
            <div className="flex items-start">
                <span className="mr-2 text-primary"><ArrowRightIcon/></span>
                <p>El resto se usa para el desarrollo y moderación de la plataforma.</p>
            </div>
        </div>

        <p className="flex justify-end"><Link href="/articulo?i=Cabildo_Abierto%3A_Financiamiento">Leer más</Link></p>
    </div>

    return <Desplegable
        text={howUsedText}
        btn={<div className="rounded text-[var(--text-light)]"><span className="link3">¿Cómo se usan los aportes?</span><ExpandMoreIcon/></div>}
        btnOpen={<div className="rounded text-[var(--text-light)]"><span className="link3">¿Cómo se usan los aportes?</span><ExpandLessIcon/></div>}
    />
}


const DonatedSoFar = ({user, donationsDistribution}: {user: UserProps, donationsDistribution: number[]}) => {
    let totalDonations = 0
    user.subscriptionsBought.forEach(({price}) => {totalDonations += price})

    const today = new Date()
    const months = Math.ceil((today.getTime() - new Date(user.createdAt).getTime()) / (1000*3600*24*30))

    const meanDonations = totalDonations / months

    if(totalDonations == 0){
        return <></>
    }

    let p = 0
    while(p < 100 && totalDonations > donationsDistribution[p]) p++

    return <div className="mt-8 text-[var(--text-light)] text-center">
        <div>Aportaste hasta ahora ${totalDonations} (${meanDonations} por mes).</div>
        <div>Es más que el <span className="text-[var(--primary)]">{p}%</span> de los usuarios. ¡Gracias!</div>
    </div>
}


export const BackButton = ({onClick}: {onClick: () => void}) => {
    return <Button
        sx={{textTransform: "none"}}
        onClick={onClick}
    >
        Volver
    </Button>
}


function DonationPage() {
    const [choice, setChoice] = useState("none")
    const [preferenceId, setPreferenceId] = useState<undefined | string>()
    const [amount, setAmount] = useState(500)
    const {user} = useUser()
    const {price} = useSubscriptionPrice()
    const {fundingPercentage} = useFundingPercentage()
    const {donationsDistribution} = useDonationsDistribution()

    if(!price || fundingPercentage == undefined || donationsDistribution == undefined){
        return <LoadingSpinner/>
    }

    const maxAmount = 1000000
    const minAmount = 1

    const validAmount = amount >= minAmount && amount <= maxAmount

    async function onUniqueChosen(){
        setChoice("unique")
        const {id, error} = await createPreference(user.id, amount)
        if(error) return {error}
        setPreferenceId(id)
        return {}
    }

    async function handleAmountChange(val){
        if(val === ''){
          setAmount(0)
        } else if(Number.isInteger(+val)){
          setAmount(val)
        }
    }

    const donationInput = <div className="mt-8">
        {choice == "none" && <div className="flex justify-center">
            <div className="flex flex-col justify-center items-center">
                <div className="flex items-center flex-col bg-[var(--secondary-light)] p-4 rounded-lg  mt-4">
                    <div className="text-center text-[var(--text-light)] mb-2 title">
                        Estado de financiamiento
                    </div>
                    <div className="w-full px-6">
                        <FundingProgress p={fundingPercentage}/>
                    </div>
                </div>

                <div className="mt-8">
                    <HowUsed/>
                </div>

                {user && <DonatedSoFar user={user} donationsDistribution={donationsDistribution}/>}
            </div>
        </div>}
        {choice == "aportar" && <div className="flex justify-center mt-8">
            <div className="w-72 lg:w-96">
                <div className="flex justify-center">
                    <div className="flex flex-col items-center">
                        <div className="flex flex-col items-center">
                            <label htmlFor="integer-input" className="mb-2 text-gray-700 text-sm sm:text-base">
                                Elegí una cantidad
                            </label>
                            <IntegerInputPlusMinus value={amount} onChange={handleAmountChange}/>
                        </div>
                    </div>
                </div>

                {amount > maxAmount && <div className="flex justify-center text-[var(--text-light)] py-2 text-center">
                    Para donar más de ${maxAmount} contactate con nosotros.
                </div>}
                
                {amount % price.price != 0 && <div className="flex justify-center text-[var(--text-light)] py-2 text-xs sm:text-sm">
                    Por ahora solo aceptamos múltiplos de {price.price}.
                </div>}
                
                <div className="flex justify-center space-x-4 mt-12">
                    <StateButton
                        text1="Continuar"
                        disabled={!validAmount}
                        handleClick={onUniqueChosen}
                    />
                    <BackButton onClick={() => {setChoice("none")}}/>
                </div>
            </div>
        </div>}
        {choice == "none" && <div className="flex justify-center mt-8">
            <Button
                startIcon={<DonateIcon/>}
                variant="contained"
                color="primary"
                size="large"
                onClick={() => {setChoice("aportar")}}
                sx={{textTransform: "none"}}
            >
                <span className="title">Aportar</span>
            </Button>
        </div>}
    </div>

    const uniqueChosen = <div className="flex flex-col items-center">
        <UniqueDonationCheckout amount={amount} preferenceId={preferenceId}/>
        <BackButton
            onClick={() => {setChoice("aportar")}}
        />
    </div>

    const center = <>
        {choice == "unique" && uniqueChosen}
        {choice != "unique" && donationInput}
    </>

    return <ThreeColumnsLayout center={center}/>
}

export default DonationPage