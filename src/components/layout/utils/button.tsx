import type {ButtonProps as MUIButtonProps} from "@mui/material/Button";
import MUIButton from "@mui/material/Button";

import React from "react";
import {Color} from "./color";


export type ButtonProps = Omit<MUIButtonProps, "color"> & {
    color?: Color
    textTransform?: string
    borderColor?: Color
    hoverColor?: Color
    paddingX?: string | number
    paddingY?: string | number
}

const darkerMap: Partial<Record<Color, Color>> = {
    "primary": "primary-dark",
    "primary-dark": "primary-dark2",
    "background": "background-dark",
    "background-dark": "background-dark2",
    "background-dark2": "background-dark3",
    "transparent": "background-dark",
    "accent": "accent-dark",
    "red": "red-dark",
    "red-dark": "red-dark2",
}

export function darker(color: Color, n: number = 1): Color {
    if (n <= 0) return color
    const darkerColor = darkerMap[color]
    if (!darkerColor) return color
    return darker(darkerColor, n - 1);
}

export const Button = ({
                           children,
                           sx,
                           variant = "contained",
                           disableElevation = true,
                           color = "background-dark",
    paddingX,
    paddingY,
    hoverColor,
                           textTransform,
    borderColor = "accent-dark",
                           ...props
                       }: ButtonProps) => {
    let textColor =
        color == "primary" && variant == "contained"
            ? "var(--button-text)"
            : "var(--text)"

    return (
        <MUIButton
            {...props}

            sx={{
                borderRadius: 0,
                textTransform,
                paddingX,
                paddingY,
                ...sx,
                transition: "none",
                color: textColor,
                backgroundColor: `var(--${color})`,
                borderColor: `var(--${borderColor})`,
                ":hover": {
                    backgroundColor: hoverColor ? `var(--${hoverColor})` : `var(--${darker(color)})`,
                },
            }}
            variant={variant}
            disableElevation={disableElevation}
        >
            {children}
        </MUIButton>
    )
}
