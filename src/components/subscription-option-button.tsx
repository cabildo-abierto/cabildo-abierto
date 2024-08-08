"use client"
import Link from "next/link"
import React from "react"

const SubscriptionOptionButton: React.FC<any> = ({title, description, disabled=false, price=null, href}) => {
    return <Link 
        href={href} 
        className=""
        >
        <button
            className="lg:w-96 w-72 subscription-btn flex flex-col items-center disabled:bg-gray-600"
            disabled={disabled}
        >
        
        <div className="flex justify-center">
            <h3 className="text-lg text-white">{title}</h3>
        </div>
            
        <div className="flex justify-center text-gray-200">
            {description}
        </div>
            
        {price && <div className="flex justify-center mt-3">
            <span className="rounded border border-2 border-gray-600 text-white px-2 py-1">
                {price}
            </span>
        </div>
        }
        </button>
    </Link>
}

export default SubscriptionOptionButton