"use client"
import dynamic from 'next/dynamic'
import { initMercadoPago } from '@mercadopago/sdk-react';
import { useState } from 'react';
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {Note} from "@/components/utils/base/note";


const Wallet = dynamic(() => import('@mercadopago/sdk-react').then(mod => mod.Wallet), { ssr: false });
initMercadoPago('APP_USR-178a0c6a-a060-4bf4-9099-3dd93dd2efa8')


const LoadingWallet = () => {
    return <div className="fixed left-0 top-12 w-screen h-screen bg-[var(--background)]">
        <div className="flex justify-center items-center w-screen mt-32">
            <LoadingSpinner/>
        </div>
    </div>
}


export const MPWallet = ({preferenceId, verification}: {preferenceId: string, verification: boolean}) => {
    const [walletReady, setWalletReady] = useState(false)
    return <div className="flex flex-col items-center">

        {!walletReady && <LoadingWallet/>}

        <Note className="pb-4">
            <p>Podés usar tu dinero en cuenta, tarjeta de débito o tarjeta de crédito.</p>
            {verification ?
                <p>
                    Asegurate de usar tu cuenta de Mercado Pago para que la verificación funcione correctamente.
                </p> :
                <p>No necesitás una cuenta de Mercado Pago.</p>}

        </Note>

        <Wallet
            onReady={() => {setWalletReady(true)}}
            initialization={{ preferenceId }}
        />
    </div>
}