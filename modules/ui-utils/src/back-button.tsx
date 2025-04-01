import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { CustomLink as Link } from './custom-link';
import {IconButton} from "@mui/material";

export const BackButton = ({url, onClick, size="medium"}: {size?: "small" | "medium" | "large", url?: string, onClick?: () => void}) => {
    if(url != undefined){
        return <Link href={url}><IconButton size={size} color={"inherit"}>
            <ArrowBackIcon fontSize={"inherit"} color={"inherit"}/>
        </IconButton>
        </Link>
    } else {
        return <IconButton onClick={onClick} size={size} color={"inherit"}>
            <ArrowBackIcon fontSize={"inherit"} color={"inherit"}/>
        </IconButton>
    }
}