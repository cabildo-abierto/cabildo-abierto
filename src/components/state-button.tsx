"use client"

import { ReactNode, useState } from "react"

type StateButtonProps = {
    onClick: (e?: any) => void
    className: string
    text1: ReactNode
    text2?: ReactNode
    disabled?: boolean
    reUsable?: boolean
}

const StateButton: React.FC<StateButtonProps> = (
    {onClick, className, text1, text2, disabled=false, reUsable=false}) => {
    const [submitting, setSubmitting] = useState(false)

    const handleClick = async (e) => {
        e.stopPropagation()
        e.preventDefault()
        setSubmitting(true)
        await onClick(e)
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