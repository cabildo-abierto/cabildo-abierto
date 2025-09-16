import type {ButtonProps as MUIButtonProps} from "@mui/material/Button";
import MUIButton from "@mui/material/Button";

import React from "react";
import {Color} from "./color";


export type ButtonProps = Omit<MUIButtonProps, "color"> & {
    color?: Color, dense?: boolean, textTransform?: string, borderColor?: Color }

export function darker(color: Color): Color {
    if (color == "primary") return "primary-dark"
    else if (color == "background") return "background-dark"
    else if (color == "background-dark") return "background-dark2"
    else if (color == "background-dark2") return "background-dark3"
    else if (color == "background-dark3") return "background-dark4"
    else if (color == "transparent") return "background-dark"
    else if (color == "accent") return "accent-dark"
    else if (color == "red") return "red-dark"
    else if (color == "red-dark") return "red-dark2"
    else return color
}

export const Button = ({
                           children,
                           sx,
                           variant = "contained",
                           disableElevation = true,
                           color = "primary",
                           dense = false,
                           textTransform = "none",
    borderColor,
                           ...props
                       }: ButtonProps) => {
    let textColor =
        color == "primary" && variant == "contained"
            ? "var(--button-text)"
            : "var(--text)"

    const densePadding = dense ? {
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: "5px",
        paddingRight: "5px"
    } : {}

    if(color == "primary") {
        color = "background-dark"
        textColor = "var(--text)"
        textTransform = undefined
        variant = "outlined"
        borderColor = "text-lighter"
    }

    return (
        <MUIButton
            {...props}
            sx={{
                borderRadius: 0,
                ...sx,
                textTransform,
                color: textColor,
                backgroundColor: `var(--${color})`,
                borderColor: `var(--${borderColor})`,
                ":hover": {
                    backgroundColor: `var(--${darker(color)})`,
                },
                ...densePadding
            }}
            variant={variant}
            disableElevation={disableElevation}
        >
            {children}
        </MUIButton>
    )
}
