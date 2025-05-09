import {IconButton as MUIIconButton, IconButtonProps as MUIIconButtonProps} from "@mui/material"
import {darker, Color} from "./button";

type IconButtonProps = Omit<MUIIconButtonProps, "color"> & { color?: Color }


export const IconButton = ({
                               children,
                               sx,
                               color = "background",
                               ...props
                           }: IconButtonProps) => {
    return <MUIIconButton
        {...props}
        sx={{
            textTransform: 'none',
            color: "inherit",
            borderRadius: "20px",
            backgroundColor: `var(--${color})`,
            ":hover": {
                backgroundColor: `var(--${darker(color)})`
            }
            , ...sx
        }}
    >
        {children}
    </MUIIconButton>
}