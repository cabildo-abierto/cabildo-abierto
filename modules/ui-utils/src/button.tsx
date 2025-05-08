import {Button as MUIButton, ButtonProps as MUIButtonProps} from "@mui/material";
import React from "react";


export type ButtonProps = MUIButtonProps

export const Button = ({children, sx, variant="contained", disableElevation=true, ...props}: ButtonProps) => {
    return <MUIButton {...props}
          sx={{
              textTransform: 'none',
              color: "var(--button-text)",
              borderRadius: "20px"
          , ...sx}}
          variant={variant}
          disableElevation={disableElevation}
    >
        {children}
    </MUIButton>
}