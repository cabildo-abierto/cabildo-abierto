"use client"

import React from "react"
import SubscriptionOptions from "./subscription-options"
import ActiveSubscription from "./active-subscription"
import { useUser } from "./user-provider"
import { validSubscription } from "./utils"

const SubscriptionPage: React.FC = () => {
    const {user, setUser} = useUser()
    
    const valid = validSubscription(user)
    return <>{valid ? <ActiveSubscription/>
        : <SubscriptionOptions/>}
    </>
}

export default SubscriptionPage