import MUIButton from "@mui/material/Button";
import type {ButtonProps as MUIButtonProps} from "@mui/material/Button";

import React from "react";


export type Color = "text-lighter" |
    "text-light" |
    "text" | "button-text" | "accent" | "accent-dark" |
    "transparent" | "primary" | "background" |
    "background-dark" | "background-dark2" | "background-dark4" |
    "background-dark3" | "primary-dark" | "red" |
    "background-ldark" | "red-dark" | "red-dark2"


export type ButtonProps = Omit<MUIButtonProps, "color"> & { color?: Color, dense?: boolean }

export function darker(color: Color): Color {
    if (color == "primary") return "primary-dark"
    else if (color == "background") return "background-dark"
    else if (color == "background-dark") return "background-dark2"
    else if (color == "background-dark2") return "background-dark3"
    else if (color == "background-dark3") return "background-dark4"
    else if (color == "transparent") return "background-dark"
    else if (color == "accent") return "accent-dark"
    else if (color == "red") return "red-dark2"
    else return color
}

export const Button = ({
                           children,
                           sx,
                           variant = "contained",
                           disableElevation = true,
                           color = "primary",
                           dense = false,
                           ...props
                       }: ButtonProps) => {
    const textColor =
        color == "primary" && variant == "contained"
            ? "var(--button-text)"
            : "var(--text)"

    const densePadding = dense ? {
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0
    } : {}

    return (
        <MUIButton
            {...props}
            sx={{
                textTransform: "none",
                color: textColor,
                borderRadius: "20px",
                backgroundColor: `var(--${color})`,
                ":hover": {
                    backgroundColor: `var(--${darker(color)})`,
                },
                ...densePadding,
                ...sx,
            }}
            variant={variant}
            disableElevation={disableElevation}
        >
            {children}
        </MUIButton>
    )
}
