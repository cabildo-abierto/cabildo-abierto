"use client"

import React, {ReactNode, useEffect, useState} from 'react';
import {Popper, Fade} from '@mui/material';
import ClickAwayListener from '@mui/material/ClickAwayListener';

type ModalOnClickProps = {
    children: ReactNode
    modal: ReactNode
    setOnClose?: (onClose: () => void) => void
}

export const ModalOnClick = ({ children, modal, setOnClose }: ModalOnClickProps) => {
    const [open, setOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        setAnchorEl(e.currentTarget);
        setOpen(true);
    };

    const handleClickAway = () => {
        setOpen(false);
    };

    useEffect(() => {
        if (setOnClose) {
            setOnClose(handleClickAway);
        }
    }, [setOnClose]);

    return (
        <>
            <div onClick={handleClick}>
                {children}
            </div>
            <Popper open={open} anchorEl={anchorEl} placement="bottom-start" transition>
                {({ TransitionProps }) => (
                    <ClickAwayListener onClickAway={handleClickAway}>
                        <Fade {...TransitionProps} timeout={350}>
                            <div className="mt-2 bg-[var(--background-dark)]">
                                {modal}
                            </div>
                        </Fade>
                    </ClickAwayListener>
                )}
            </Popper>
        </>
    );
};

