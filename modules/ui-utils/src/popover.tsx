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
        <div aria-describedby={id} ref={buttonRef} onClick={handleClick}>
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
                    boxShadow: 'none'
                }
            }}
            sx={{
                '& .MuiPopover-paper': {
                    marginTop: '4px'
                }
            }}
            disableScrollLock={true}
        >
            {modal(handleClose)}
        </Popover>
    </>
};

