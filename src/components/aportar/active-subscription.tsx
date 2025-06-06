"use client"
import LoadingSpinner from '../../../modules/ui-utils/src/loading-spinner';
import { CustomLink as Link } from '../../../modules/ui-utils/src/custom-link';
import FundingProgress from '@/components/aportar/funding-progress';
import { Desplegable } from '../../../modules/ui-utils/src/desplegable';
import { useState } from 'react';
import { IntegerInputPlusMinus } from '@/components/aportar/integer-input-plus-minus';
import { UniqueDonationCheckout } from '@/components/aportar/unique-donation-checkout';
import { ArrowRightIcon } from '@/components/icons/arrow-right-icon';
import DonateIcon from '@/components/icons/donate-icon';
import { ExpandLessIcon } from '@/components/icons/expand-less-icon';
import { ExpandMoreIcon } from '@/components/icons/expand-more-icon';
import {useSession} from "@/queries/api";
import {BackButton} from "../../../modules/ui-utils/src/back-button";
import {Button} from "../../../modules/ui-utils/src/button";


const createPreference = async (did: string, amount: number) => {
    return {id: undefined, error: "Sin implementar."}
}


const HowUsed = () => {

    const howUsedText = <div className="text-sm sm:text-base flex flex-col justify-center mt-4 lg:w-96 w-64 link space-y-2 rounded-xl bg-[var(--secondary-light)] p-4">
        <div className="space-y-2 ">
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


const DonatedSoFar = ({donationsDistribution}: {donationsDistribution: number[]}) => {
    const {user} = useSession()
    let totalDonations = 0
    // TO DO
    /*
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

     */
    return null
}
