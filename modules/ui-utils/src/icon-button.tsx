import {IconButton as MUIIconButton, IconButtonProps as MUIIconButtonProps} from "@mui/material"

type IconButtonProps = MUIIconButtonProps

export const IconButton = ({...props}: IconButtonProps) => {
    return <MUIIconButton {...props}/>
}