import React from "react"
import SubscriptionOptions from "./subscription-options"
import ActiveSubscription from "./active-subscription"
import { validSubscription } from "./utils"
import { getUser } from "@/actions/get-user"

const SubscriptionPage: React.FC = async () => {
    const user = await getUser()

    const valid = validSubscription(user)
    return <>{valid ? <ActiveSubscription/>
        : <SubscriptionOptions/>}
    </>
}

export default SubscriptionPage