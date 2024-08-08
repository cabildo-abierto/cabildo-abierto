"use client"

import { useState } from "react"

const StateButton: React.FC<any> = ({onClick, className, text1, text2=null, disabled=false}) => {
    const [submitting, setSubmitting] = useState(false)

    const handleClick = async () => {
        setSubmitting(true)
        await onClick().then(() =>{
            setSubmitting(false)
        })
    }

    return <button 
        className={className}
        onClick={handleClick}
        disabled={submitting || disabled}
    >
        {!submitting ? text1 : (text2 ? text2 : text1)}
    </button>
}

export default StateButton