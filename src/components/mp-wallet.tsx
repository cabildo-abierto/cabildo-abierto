"use client"
import dynamic from 'next/dynamic'
import { initMercadoPago } from '@mercadopago/sdk-react';
import { useState } from 'react';
import LoadingSpinner from './loading-spinner';


const Wallet = dynamic(() => import('@mercadopago/sdk-react').then(mod => mod.Wallet), { ssr: false });
initMercadoPago('APP_USR-1ddae427-daf5-49b9-b3bb-e1d5b5245f30')


const LoadingWallet = () => {
    return <div className="fixed left-0 top-12 w-screen h-screen bg-[var(--background)]">
        <div className="flex justify-center items-center w-screen mt-32">
            <LoadingSpinner/>
        </div>
    </div>
}


export const MPWallet = ({preferenceId}: {preferenceId: string}) => {
    const [walletReady, setWalletReady] = useState(false)
    return <div className="flex flex-col items-center">

        {!walletReady && <LoadingWallet/>}

        <div className="text-sm text-[var(--text-light)] text-center w-72">
            No necesitás una cuenta de Mercado Pago y vas a poder pagar con tarjeta de crédito o débito.
        </div>

        <Wallet
            onReady={() => {setWalletReady(true)}}
            initialization={{ preferenceId: preferenceId }}
        />
    </div>
}