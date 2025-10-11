import React, {ReactNode, useRef, useState} from 'react';
import {Popover} from '@mui/material';
import DescriptionOnHover from "./description-on-hover";

type ClickableModalOnClickProps = {
    children: ReactNode
    id: string
    modal: (close: () => void) => ReactNode
    className?: string
    description?: string
}

export const ClickableModalOnClick = ({
    children,
    id,
    modal,
    description
}: ClickableModalOnClickProps) => {
    const buttonRef = useRef<HTMLDivElement>(null)
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null)

    function handleClick() {
        setAnchorEl(buttonRef.current)
    }

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl)

    return <>
        <div aria-describedby={id} ref={buttonRef} onClick={(e) => {e.stopPropagation(); handleClick()}}>
            <DescriptionOnHover description={!open ? description : undefined}>
                {children}
            </DescriptionOnHover>
        </div>
        <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            style={{
                zIndex: 1300
            }}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            PaperProps={{
                elevation: 0,
                style: {
                    borderRadius: 0,
                    boxShadow: 'none'
                },
                border: "1px solid var(--accent-dark)"
            }}
            sx={{
                '& .MuiPopover-paper': {
                    marginTop: '4px',
                    borderRadius: 0,
                    border: "1px solid var(--accent-dark)"
                }
            }}
            disableScrollLock={true}
            onClick={(e => {e.stopPropagation()})}
        >
            {modal(handleClose)}
        </Popover>
    </>
};

