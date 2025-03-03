import { MPWallet } from "./mp-wallet";



export function UniqueDonationCheckout({amount, preferenceId}: {amount: number, preferenceId: string}) {

    return <div className="flex mt-32 flex-col items-center">
        <div className="px-2 mb-16">
            <MPWallet preferenceId={preferenceId}/>
        </div>
    </div>
}