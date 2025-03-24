"use client";

import { ReactNode, useEffect, useState } from 'react';
import { AcceptButtonPanel } from './accept-button-panel';
import {Button} from "@mui/material";

export type StateButtonProps = {
    handleClick?: StateButtonClickHandler;
    variant?: "text" | "contained" | "outlined";
    className?: string
    color?: "primary" | "secondary" | "error" | "inherit"
    size?: "small" | "medium" | "large",
    text1: ReactNode;
    text2?: ReactNode;
    startIcon?: ReactNode;
    textClassName?: string;
    disabled?: boolean;
    disableElevation?: boolean
    sx?: any
    fullWidth?: boolean
    stopPropagation?: boolean
};

export type StateButtonClickHandler = () => Promise<{ error?: string; stopResubmit?: boolean }>;

const StateButton = ({
    handleClick=async () => {return {}},
    variant = "contained",
    color = "primary",
    textClassName = "",
    startIcon,
    text1,
    text2,
    size,
    disabled = false,
    disableElevation = true,
    fullWidth,
    sx,
    stopPropagation=true
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
            variant={variant}
            color={color}
            size={size}
            onClick={onClick}
            disabled={disabled}
            disableElevation={disableElevation}
            sx={{
                textTransform: 'none',
                color: "var(--text)"
            , ...sx}}
            fullWidth={fullWidth}
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
