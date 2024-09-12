"use client"
import React from "react"
import SubscriptionOptions from "./subscription-options"
import ActiveSubscription from "./active-subscription"
import { validSubscription } from "./utils"
import { useUser } from "../app/hooks/user"

const SubscriptionPage: React.FC = () => {
    const {user} = useUser()

    const valid = validSubscription(user)
    return <>{valid ? <ActiveSubscription/>
        : <SubscriptionOptions/>}
    </>
}

export default SubscriptionPage