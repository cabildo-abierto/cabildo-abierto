import React, {ReactNode} from 'react';
import {Popper, Fade} from '@mui/material';
import ClickAwayListener from '@mui/material/ClickAwayListener';

type ModalOnClickControlledProps = {
    children: ReactNode
    modal: (close: () => void) => ReactNode
    open: boolean
    setOpen: (v: boolean) => void
    anchorEl: HTMLElement | null
    handleClick: (event: React.MouseEvent<HTMLDivElement>) => void;
    handleClickAway: () => void
}

export const ModalOnClickControlled = ({
                                           children,
                                           handleClick,
                                           handleClickAway,
                                           modal,
                                           open,
                                           setOpen,
                                           anchorEl
                                       }: ModalOnClickControlledProps) => {

    return (
        <>
            <ClickAwayListener onClickAway={(e) => {
                handleClickAway()
            }}>
                <div>
                    <div onClick={handleClick}>
                        {children}
                    </div>
                    <Popper
                        open={open}
                        anchorEl={anchorEl}
                        placement="bottom-start"
                        transition
                        style={{zIndex: 1300}}
                    >
                        {({TransitionProps}) => (
                            <Fade {...TransitionProps}
                                  timeout={{enter: 350, exit: 0}} // Only fade on open
                            >
                                <div className="mt-2 bg-[var(--background-dark)]">
                                    {modal(() => {
                                        setOpen(false)
                                    })}
                                </div>
                            </Fade>
                        )}
                    </Popper>
                </div>
            </ClickAwayListener>
        </>
    );
};

