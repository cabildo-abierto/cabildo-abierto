import { Popover } from "@mui/material";
import { ReactNode } from "react";


export const ModalBelow = ({children, open, onClose, anchorEl, marginTop="10px", hoverOnly=false}: 
    {
        children: ReactNode
        open: boolean
        onClose: () => void
        anchorEl: HTMLElement
        marginTop?: string
        hoverOnly?: boolean
    }) => {

    return <Popover
        id={open ? "popover" : undefined}
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        BackdropProps={{
            onClick: (e) => {
                e.stopPropagation();
                e.preventDefault();
                onClose();
            },
        }}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
        }}
        PaperProps={hoverOnly ? {
          sx: {
            boxShadow: "none",
          },
        } : undefined}
        sx={{
            marginTop: marginTop,
            pointerEvents: hoverOnly ? "none" : "auto"
        }}
    >
      {children}
    </Popover>
}