"use client"
import { useRouter } from "next/navigation"

const SubscriptionOptionButton = ({title, description, disabled=false, price=null, href}) => {
    const router = useRouter()
    return <div className="flex-1 px-2">
        <button 
            className="subscription-btn w-full disabled:bg-gray-600" 
            onClick={() => {router.push(href)}}
            disabled={disabled}>
            <div className="text-lg">{title}</div>
            <div className="text-gray-200 font-normal">{description}</div>
            {price && <div className="mt-3">
            <span className="rounded border border-2 border-gray-600 text-white px-2 py-1">{price}</span>
            </div>}
        </button>
    </div>
}

export default SubscriptionOptionButton