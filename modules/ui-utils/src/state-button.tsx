"use client";

import { ReactNode, useEffect, useState } from 'react';
import { AcceptButtonPanel } from './accept-button-panel';
import {Button, ButtonProps} from "./button";

export type StateButtonProps = ButtonProps & {
    handleClick?: StateButtonClickHandler
    text1: ReactNode
    text2?: ReactNode
    startIcon?: ReactNode
    textClassName?: string
    stopPropagation?: boolean
};

export type StateButtonClickHandler = () => Promise<{ error?: string; stopResubmit?: boolean }>;

const StateButton = ({
    handleClick=async () => {return {}},
    color = "primary",
    textClassName = "",
    startIcon,
    text1,
    text2,
    size,
    disabled = false,
    disableElevation = true,
    fullWidth,
    stopPropagation=true,
    ...props
}: StateButtonProps) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(undefined)

    async function onClick(e) {
        if(stopPropagation){
            e.stopPropagation()
            e.preventDefault()
        }
        setLoading(true)
    }

    useEffect(() => {
        async function submit(){
            const result = await handleClick()
            if(result.error){
                setError(result.error)
            }
            if(!result.stopResubmit){
              setLoading(false)
            }
        }

        if(loading){
            submit()
        }
    }, [loading])

    return <>
        <Button
            loading={loading}
            startIcon={startIcon}
            loadingIndicator={text2}
            color={color}
            size={size}
            onClick={onClick}
            disabled={disabled}
            disableElevation={disableElevation}
            fullWidth={fullWidth}
            {...props}
        >
            <div className={textClassName}>
                {text1}
            </div>
        </Button>
        <AcceptButtonPanel
            open={Boolean(error)}
            onClose={() => {setError(undefined)}}
        >
            <div className={"text-[var(--text-light)]"}>
                {error}
            </div>
        </AcceptButtonPanel>
    </>
};

export default StateButton;
