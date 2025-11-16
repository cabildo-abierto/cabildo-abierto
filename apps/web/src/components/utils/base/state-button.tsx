import {ReactNode, useEffect, useState} from 'react';
import {BaseButton, BaseButtonProps as ButtonProps} from "./base-button";
import {useErrors} from "@/components/layout/contexts/error-context";
import {cn} from "@/lib/utils";

export type StateButtonProps = Omit<ButtonProps, "onClick"> & {
    handleClick?: StateButtonClickHandler
    children: ReactNode
    startIcon?: ReactNode
    textClassName?: string
    stopPropagation?: boolean
}

export type StateButtonClickHandler = (e: MouseEvent) => Promise<{ error?: string; stopResubmit?: boolean}> | void

export const StateButton = ({
                         handleClick = async () => {
                             return {}
                         },
                         startIcon,
                         children,
                         size,
                         disabled = false,
                         stopPropagation = true,
                         className,
                         textClassName, // en este momento se concatena a className
                         ...props
                     }: StateButtonProps) => {
    const [loading, setLoading] = useState(false)
    const [mouseEvent, setMouseEvent] = useState<any>(null)
    const {addError} = useErrors()

    useEffect(() => {
        async function submit() {
            const result = await handleClick(mouseEvent)
            if (result && result.error) {
                addError(result.error)
            }
            if (!result || !result.stopResubmit) {
                setLoading(false)
            }
        }

        if (loading) {
            submit()
        }
    }, [loading])

    return <BaseButton
        startIcon={startIcon}
        size={size}
        loading={loading}
        className={cn(className, textClassName)}
        onClick={(e) => {
            if (stopPropagation) {
                e.stopPropagation()
                e.preventDefault()
            }
            setLoading(true)
            setMouseEvent(e)
        }}
        disabled={disabled}
        {...props}
    >
        {children}
    </BaseButton>
}
