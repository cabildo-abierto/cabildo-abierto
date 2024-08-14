import { ThreeColumnsLayout } from "@/components/main-layout"
import { getUser } from "@/actions/get-user"
import { NewDonation } from "@/components/new-donation"
import Link from "next/link"


export default async function DonationPage() {
    const user = await getUser()

    const center = <div className="mt-8">
        <div className="flex justify-center items-center">
            <h3>
                Donar suscripciones
            </h3>
        </div>
        <div className="flex justify-center">
            <div className="w-72 lg:w-96">
                <NewDonation user={user}/>
                <div className="flex justify-end items-center mt-4">
                    <div>
                        <Link href="/suscripciones">
                            <button className="gray-btn">Volver</button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    </div>

    return <ThreeColumnsLayout center={center} centerWidth={600}/>

}