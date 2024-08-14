"use client"
import Link from "next/link"
import React from "react"

const SubscriptionOptionButton: React.FC<any> = ({title, description, disabled=false, price=null, href}) => {
    return <Link 
        href={href} 
        className=""
        >
        <button
            className="lg:w-96 w-72 subscription-btn flex flex-col items-center"
            disabled={disabled}
        >
        
        <div className="flex justify-center">
            <h3 className="text-lg">{title}</h3>
        </div>
            
        <div className="flex justify-center">
            {description}
        </div>
            
        {price && <div className="flex justify-center mt-3">
            <span className="rounded border bg-[var(--primary-dark)] px-2 py-1">
                {price}
            </span>
        </div>
        }
        </button>
    </Link>
}

export default SubscriptionOptionButton