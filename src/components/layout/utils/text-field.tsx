import MUITextField from "@mui/material/TextField";
import type {TextFieldProps as MUITextFieldProps} from "@mui/material/TextField";
import {Color} from "./color";

type TextFieldProps = Omit<MUITextFieldProps, "fontSize" | "color"> & {
    fontSize?: number | string
    color?: Color
    borderRadius?: number | string
    borderColor?: Color
    paddingX?: string | number
    paddingY?: number | string
    borderWidthNoFocus?: number | string
    borderWidth?: number | string
    autoComplete?: string
}

export const TextField = ({
                              children,
                              fontSize,
                              color = "transparent",
                              borderRadius = 0,
                              borderColor = "accent-dark",
                              paddingY = "8px",
                              paddingX = "0px",
                              borderWidthNoFocus = "1px",
                              borderWidth = "1px",
                              autoComplete="off",
                              ...props
                          }: TextFieldProps) => {
    return (
        <MUITextField
            {...props}

            sx={{
                "& .MuiOutlinedInput-root": {
                    fontSize,
                    backgroundColor: `var(--${color})`,
                    borderRadius,
                    borderColor: `var(--${borderColor})`,
                    "& input": {
                        paddingY: paddingY
                    },
                    "& fieldset": {
                        borderRadius,
                        borderColor: `var(--${borderColor})`,
                        borderWidth: borderWidthNoFocus
                    },
                    "&:hover fieldset": {
                        borderColor: `var(--${borderColor})`,
                    },
                    "&.Mui-focused fieldset": {
                        borderWidth,
                        borderColor: `var(--${borderColor})`,
                    },
                },
                "& .MuiInputBase-root": {
                    paddingX,
                }
            }}

            InputProps={{
                autoComplete,
                sx: {
                    fontSize,
                    borderRadius: 0
                }
            }}
            InputLabelProps={{
                sx: {
                    fontSize,
                    "&.MuiInputLabel-shrink": {
                        color: `var(--text)`
                    }
                }
            }}
        >
            {children}
        </MUITextField>
    )
}