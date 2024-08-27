"use client"

import { useState } from "react"

type StateButtonProps = {
    onClick: () => void
    className: string
    text1: string
    text2?: string
    disabled?: boolean
    reUsable?: boolean
}

const StateButton: React.FC<StateButtonProps> = (
    {onClick, className, text1, text2, disabled=false, reUsable=false}) => {
    const [submitting, setSubmitting] = useState(false)

    const handleClick = async () => {
        setSubmitting(true)
        await onClick()
        if(reUsable){
            setSubmitting(false)
        }
    }


    return <button 
        className={className}
        onClick={handleClick}
        disabled={submitting || disabled}
    >
        {!submitting ? text1 : (text2 !== null ? text2 : text1)}
    </button>
}

export default StateButton