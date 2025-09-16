import MUITextField from "@mui/material/TextField";
import type {TextFieldProps as MUITextFieldProps} from "@mui/material/TextField";
import {Color} from "./color";

type TextFieldProps = Omit<MUITextFieldProps, "fontSize" | "color"> & {
    fontSize?: number | string
    dense?: boolean
    color?: Color
    borderRadius?: number | string
    borderColor?: Color
    paddingY?: number | string
    borderWidthNoFocus?: number | string
    borderWidth?: number | string
}

export const TextField = ({
                              children,
                              fontSize,
                              dense = false,
                              color = "transparent",
                              borderRadius = 0,
                              borderColor = "text-lighter",
                              paddingY = "8px",
                              borderWidthNoFocus="1px",
                              borderWidth="1px",
                              ...props
                          }: TextFieldProps) => {
    return (
        <MUITextField
            {...props}

            sx={{
                "& .MuiOutlinedInput-root": {
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
                }
            }}
            InputProps={{
                autoComplete: "off",
                sx: {
                    fontSize,
                    borderRadius: 0,
                    ...(dense && {
                        paddingTop: '2px',
                        paddingBottom: '4px',
                        paddingLeft: '6px',
                        paddingRight: '6px',
                        '& .MuiOutlinedInput-input': {
                            padding: '2px 4px'
                        },
                        '& .MuiFilledInput-input': {
                            paddingTop: '2px',
                            paddingBottom: '2px'
                        },
                        '& .MuiInput-input': {
                            paddingTop: '2px',
                            paddingBottom: '2px'
                        }
                    })
                }
            }}
            InputLabelProps={{
                sx: {
                    fontSize,
                    "&.MuiInputLabel-shrink": {
                        color: `var(--text-light)`
                    }
                }
            }}
        >
            {children}
        </MUITextField>
    )
}