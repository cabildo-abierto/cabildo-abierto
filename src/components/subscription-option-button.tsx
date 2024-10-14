"use client"
import { useRouter } from "next/navigation"
import React from "react"
import StateButton from "./state-button"

const SubscriptionOptionButton: React.FC<any> = ({
    title,
    description,
    disabled=false,
    price=null,
    href=null,
    onClick=null,
}) => {
    const router = useRouter()

    async function handleClick(e){
        if(onClick){
            await onClick()
        }
        if(href){
            router.push(href)
        }
        return false
    }

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

    return <StateButton
        className="lg:w-96 w-72 subscription-btn flex flex-col items-center"
        disabled={disabled}
        onClick={handleClick}
        text1={text1}
        text2={text1}
    />
}

export default SubscriptionOptionButton