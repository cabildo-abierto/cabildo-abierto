"use client"
import { getUser } from "@/actions/get-user"
import { getDonatedSubscription } from "@/actions/subscriptions"
import { ThreeColumnsLayout } from "@/components/main-layout"
import { usePoolSize } from "@/components/use-pool-size"
import { useUser } from "@/components/user-provider"
import { useRouter } from "next/navigation"


export async function updateUser(setUser: any){
    const user = await getUser()
    setUser(user)
}


export default function PlanGratuito() {
    const router = useRouter()
    const {user, setUser} = useUser()
    const {poolSize, setPoolSize} = usePoolSize()

    const handlePayment = async () => {
        if(!user) return
        await getDonatedSubscription(user.id)
        await updateUser(setUser)
        router.push("/inicio")
    }

    const center = <>
        <div className="flex justify-center mt-8">Hay {poolSize} suscripciones disponibles para usar</div>
        <div className="flex justify-center mt-8">
        <button className="large-btn py-16" onClick={handlePayment}>Usar una suscripción pendiente</button>
        </div>
    </>

    return <ThreeColumnsLayout center={center}/>

}