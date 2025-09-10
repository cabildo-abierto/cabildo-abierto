import React, {ReactNode, useState} from 'react';
import {ModalOnClickControlled} from "./modal-on-click-controlled";

type ModalOnClickProps = {
    children: ReactNode
    modal: (close: () => void) => ReactNode
    disabled?: boolean
}

export const ModalOnClick = ({children, modal, disabled=false}: ModalOnClickProps) => {
    const [open, setOpen] = useState(false)
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation()
        e.preventDefault()
        if(!disabled){
            setAnchorEl(e.currentTarget)
            setOpen(true)
        }
    }

    const handleClickAway = () => {
        setOpen(false)
    }

    return <ModalOnClickControlled
        open={open}
        setOpen={setOpen}
        modal={modal}
        anchorEl={anchorEl}
        handleClick={handleClick}
        handleClickAway={handleClickAway}
    >
        {children}
    </ModalOnClickControlled>
}

