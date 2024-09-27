"use client"
import React, { useState } from "react"
import SubscriptionOptions from "./subscription-options"
import ActiveSubscription from "./active-subscription"
import { validSubscription } from "./utils"
import { useUser } from "../app/hooks/user"
import Link from "next/link"


const FreeTrialPopup = () => {
    return (
        <>
            <div className="fixed inset-0 bg-opacity-50 bg-gray-800 z-10 flex justify-center items-center backdrop-blur-sm">
                
                <div className="bg-[var(--background)] rounded border-2 border-black p-8 z-10 text-center max-w-lg">
                    <div className="py-4 text-lg">¡Genial! Se activó tu suscripción.</div>
                    <div className="flex justify-center items-center py-8 space-x-4">
                        <Link href="/" className="gray-btn">
                            Aceptar
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};



const SubscriptionPage: React.FC = () => {
    const {user} = useUser()
    const [showingFreeTrial, setShowingFreeTrial] = useState(false)

    const valid = validSubscription(user)
    return <>
        {showingFreeTrial && <FreeTrialPopup/>}
        {valid ? <ActiveSubscription/>
        : <SubscriptionOptions setShowingFreeTrial={setShowingFreeTrial}/>}
    </>
}

export default SubscriptionPage