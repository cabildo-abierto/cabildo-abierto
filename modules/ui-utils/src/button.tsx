
import {Button as MUIButton, ButtonProps as MUIButtonProps} from "@mui/material";


export type ButtonProps = MUIButtonProps

export const Button = ({sx, variant="contained", ...props}: ButtonProps) => {
    return <MUIButton {...props}
          sx={{
              textTransform: 'none',
              color: "var(--text)"
          , ...sx}}
          variant={variant}
    />
}