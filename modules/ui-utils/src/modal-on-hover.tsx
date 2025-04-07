"use client"

import React, {useState, useRef, ReactNode} from 'react';
import {Fade, Popper} from '@mui/material';

type ModalOnHoverProps = {
    children: ReactNode
    modal: ReactNode
}

export const ModalOnHover = ({children, modal}: ModalOnHoverProps) => {
    const [open, setOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setAnchorEl(event.currentTarget);
        setOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setOpen(false);
        }, 150);
    };

    const handleModalEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    const handleModalLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setOpen(false);
        }, 150);
    };

    return (
        <>
            <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {children}
            </div>

            <Popper open={open} anchorEl={anchorEl} placement="bottom-start" transition>
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={350}>
                        <div className={"mt-2"}
                            onMouseEnter={handleModalEnter}
                            onMouseLeave={handleModalLeave}
                        >
                            {modal}
                        </div>
                    </Fade>
                )}
            </Popper>
        </>
    );
};
