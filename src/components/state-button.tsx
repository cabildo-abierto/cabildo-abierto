"use client"

import { ReactNode, useState } from "react"
import { ErrorMsg } from "./write-button"
import { AcceptButtonPanel } from "./accept-button-panel"

type StateButtonProps = {
    handleClick: StateButtonClickHandler
    className: string
    text1: ReactNode
    text2?: ReactNode
    textClassName?: string
    disabled?: boolean
}

export type StateButtonClickHandler = (e?: any) => Promise<{error?: string, stopResubmit?: boolean}>

const StateButton: React.FC<StateButtonProps> = ({
    handleClick,
    className,
    textClassName="",
    text1,
    text2,
    disabled=false
}) => {
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string>()


    const clickHandle = async (e) => {
        e.stopPropagation()
        e.preventDefault()
        setSubmitting(true)
        const {stopResubmit, error: clickError} = await handleClick(e)
        if(stopResubmit == undefined || !stopResubmit || clickError){
            setSubmitting(false) // allow resubmit
        }
        if(clickError){
            setError(error)
        }
    }

    return <div className="flex flex-col items-center">
        <button 
            className={className}
            onClick={clickHandle}
            disabled={submitting || disabled}
        >
            <div className={textClassName}>{!submitting ? text1 : (text2 !== null ? text2 : text1)}</div>
        </button>
        {error && <AcceptButtonPanel
            text={error}
            onClose={() => {setError(undefined)}}
        />}
    </div>
}

export default StateButton