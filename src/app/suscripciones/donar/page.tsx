import { ThreeColumnsLayout } from "@/components/main-layout"
import { getUser } from "@/actions/get-user"
import { NewDonation } from "@/components/new-donation"
import Link from "next/link"


export default async function DonationPage() {
    const user = await getUser()

    const center = <div className="mt-8">
        <div className="flex justify-center items-center">
            <h2>
                Hacé crecer a Cabildo Abierto
            </h2>
        </div>
        <NewDonation user={user}/>
        <div className="flex justify-end items-center mt-4">
            <div>
                <Link href="/suscripciones"><button className="large-btn">Volver</button></Link>
            </div>
        </div>
    </div>

    return <ThreeColumnsLayout center={center} centerWidth={600}/>

}