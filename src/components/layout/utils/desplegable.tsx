import { ReactNode, useState } from "react"
import {CaretDownIcon, CaretUpIcon} from "@phosphor-icons/react";
import {cn} from "@/lib/utils";

export const Desplegable = ({children, text, className}: {
    children: ReactNode,
    text: string
    className?: string
}) => {
    const [open, setOpen] = useState(false)

    return <div className={cn("font-light text-base", className)}>
        <button
            onClick={() => {
                setOpen(!open)
            }}
            className={"flex space-x-1 items-center  hover:text-[var(--text-light)]"}
        >
            <span>
                {text}
            </span>
            {open ? <CaretUpIcon/> : <CaretDownIcon/>}
        </button>
        {open && <div className={"mt-2 pb-4"}>
            {children}
        </div>}
    </div>
}