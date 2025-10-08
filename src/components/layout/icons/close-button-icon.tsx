
import CloseIcon from '@mui/icons-material/Close';
import {SvgIconProps} from "@mui/material";


export const CloseButtonIcon = ({fontSize="medium", ...props}: SvgIconProps) => {
    return <CloseIcon fontSize={fontSize} {...props}/>
}