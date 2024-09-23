"use client"

import React, { ReactNode, useState } from 'react';
import ReadOnlyEditor from './editor/read-only-editor';
import { Logo } from './logo';
import { useUser } from '../app/hooks/user';
import { useRouter } from 'next/navigation';


const WelcomePopup = ({setShowingWelcome}) => {
    const router = useRouter()

    return <div className="fixed inset-0 bg-opacity-50 bg-gray-800 z-10 flex justify-center items-center backdrop-blur-sm">
        <div className="bg-[var(--background)] rounded border-2 border-black p-8 z-10 text-center max-w-lg">
            <div className="py-4 text-lg">¡Bienvenido/a a Cabildo Abierto!</div>
            <div className="text-justify text-gray-700">
                Cabildo Abierto tiene como objetivo conectar al país y abrir la discusión de lo público.
            </div>
            <div className="text-justify text-gray-700">
                Esto recién empieza. Si algo no funciona avisanos y si tenés ideas o sugerencias, te escuchamos.
            </div>
            <div className="flex justify-center items-center mt-8 space-x-4">
                <button onClick={() => {setShowingWelcome(false); router.push("/suscripciones")}} className="gray-btn">
                    Conseguir mi primera suscripción
                </button>
            </div>
            <div className="text-center text-sm text-gray-700 mt-1">
                La primera es gratis. Después también si lo necesitás.
            </div>
        </div>
    </div>
};


const WelcomeMessage: React.FC<{children: ReactNode}> = ({children}) => {
  const {user} = useUser()
  const [showingWelcome, setShowingWelcome] = useState(user && user.subscriptionsUsed.length == 0)

  return <>
    {showingWelcome && <WelcomePopup setShowingWelcome={setShowingWelcome}/>}
    {children}
  </>
}

export default WelcomeMessage