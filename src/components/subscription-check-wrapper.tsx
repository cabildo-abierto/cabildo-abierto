import { getUserById, getUserId } from "@/actions/get-user"
import { redirect } from "next/navigation"
import { getSubscriptionStatus } from "./utils"



const SubscriptionCheckWrapper = async ({children}) => {
    const userId = await getUserId()
    console.log("subscription check user id", userId)
    const user = await getUserById(userId)
    console.log("subscription check user", user)
    const validSubscription = user && getSubscriptionStatus(user.subscriptionsUsed) == "valid"
    console.log("valid subscription", validSubscription)

    if(!validSubscription){
        console.log("Redirecting to suscripciones")
        redirect("/suscripciones")
    }

    return <>
        {children}
    </>
}

export default SubscriptionCheckWrapper