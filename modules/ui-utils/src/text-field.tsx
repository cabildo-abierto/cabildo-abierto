import MUITextField from "@mui/material/TextField";
import type {TextFieldProps as MUITextFieldProps} from "@mui/material/TextField";

type TextFieldProps = Omit<MUITextFieldProps, "fontSize"> & {
    fontSize?: number | string
    dense?: boolean
}

export const TextField = ({
                              children,
                              fontSize,
                              dense = false,
                              ...props
                          }: TextFieldProps) => {
    return (
        <MUITextField
            {...props}
            InputProps={{
                autoComplete: "off",
                sx: {
                    fontSize,
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
                sx: { fontSize }
            }}
        >
            {children}
        </MUITextField>
    )
}