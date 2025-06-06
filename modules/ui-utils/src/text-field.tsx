import MUITextField from "@mui/material/TextField";
import type {TextFieldProps as MUITextFieldProps} from "@mui/material/TextField";

type TextFieldProps = Omit<MUITextFieldProps, "fontSize"> & { fontSize?: number | string }


export const TextField = ({
                              children,
                              fontSize,
                              ...props
                          }: TextFieldProps) => {
    return <MUITextField
        {...props}
        InputProps={{
            autoComplete: "off",
            sx: {fontSize}
        }}
        InputLabelProps={{
            sx: {fontSize}
        }}
    >
        {children}
    </MUITextField>
}