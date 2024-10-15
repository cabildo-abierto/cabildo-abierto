"use client"

import { ReactNode, useState } from "react"

type StateButtonProps = {
    onClick: (e?: any) => Promise<boolean>
    className: string
    text1: ReactNode
    text2?: ReactNode
    disabled?: boolean
}

const StateButton: React.FC<StateButtonProps> = ({
    onClick,
    className,
    text1,
    text2,
    disabled=false
}) => {
    const [submitting, setSubmitting] = useState(false)

    const handleClick = async (e) => {
        e.stopPropagation()
        e.preventDefault()
        setSubmitting(true)
        const stopResubmit = await onClick(e)
        if(!stopResubmit){
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