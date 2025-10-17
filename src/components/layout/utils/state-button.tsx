"use client";

import { ReactNode, useEffect, useState } from 'react';
import {Button, ButtonProps} from "./button";
import {useErrors} from "@/components/layout/error-context";

export type StateButtonProps = Omit<ButtonProps, "onClick"> & {
    handleClick?: StateButtonClickHandler
    text1: ReactNode
    text2?: ReactNode
    startIcon?: ReactNode
    textClassName?: string
    stopPropagation?: boolean
}

export type StateButtonClickHandler = (e: MouseEvent) => Promise<{ error?: string; stopResubmit?: boolean }>;

const StateButton = ({
    handleClick=async () => {return {}},
    color = "background-dark",
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
    const [mouseEvent, setMouseEvent] = useState<any>(null)
    const {addError} = useErrors()

    useEffect(() => {
        async function submit(){
            const result = await handleClick(mouseEvent)
            if(result.error){
                addError(result.error)
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
            onClick={(e) => {
                if(stopPropagation){
                    e.stopPropagation()
                    e.preventDefault()
                }
                setLoading(true)
                setMouseEvent(e)
            }}
            disabled={disabled}
            disableElevation={disableElevation}
            fullWidth={fullWidth}
            {...props}
        >
            <div className={textClassName}>
                {text1}
            </div>
        </Button>
    </>
};

export default StateButton;
