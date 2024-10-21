"use client"
import { useRouter } from "next/navigation"
import React, { ReactNode } from "react"
import StateButton, { StateButtonClickHandler } from "./state-button"
import Link from "next/link"

type SubscriptionOptionButtonProps = {
    title: string
    description: ReactNode
    disabled?: boolean
    price?: string
    href?: string
    onClick?: StateButtonClickHandler
}

const SubscriptionOptionButton: React.FC<SubscriptionOptionButtonProps> = ({
    title,
    description,
    disabled=false,
    price=null,
    href=null,
    onClick=null,
}) => {
    const text1 = <>
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
    </>

    const className = "lg:w-96 w-72 subscription-btn flex flex-col items-center"

    if(href){
        return <button className={className}>
            <Link href={href}>
                {text1}
            </Link>
        </button>
    }

    return <StateButton
        className={className}
        disabled={disabled}
        handleClick={onClick}
        text1={text1}
        text2={text1}
    />
}

export default SubscriptionOptionButton