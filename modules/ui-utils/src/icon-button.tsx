import {IconButton as MUIIconButton, IconButtonProps as MUIIconButtonProps} from "@mui/material"
import {darker, Color} from "./button";

type IconButtonProps = Omit<MUIIconButtonProps, "color"> & { color?: Color, hoverColor?: Color, textColor?: Color }


export const IconButton = ({
                               children,
                               sx,
                               color = "background",
                               hoverColor,
                               textColor,
                               ...props
                           }: IconButtonProps) => {
    if (!textColor) textColor = color == "primary" ? "button-text" : "text"
    return <MUIIconButton
        {...props}
        sx={{
            textTransform: 'none',
            color: `var(--${textColor})`,
            borderRadius: "20px",
            backgroundColor: `var(--${color})`,
            ":hover": {
                backgroundColor: hoverColor ?? `var(--${darker(color)})`
            }
            , ...sx
        }}
    >
        {children}
    </MUIIconButton>
}