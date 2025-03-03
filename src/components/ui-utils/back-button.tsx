import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { CustomLink as Link } from './custom-link';
import {IconButton} from "@mui/material";

export const BackButton = ({url, onClick}: {url?: string, onClick?: () => void}) => {
    if(url != undefined){
        return <Link href={url}><IconButton><ArrowBackIcon/></IconButton></Link>
    } else {
        return <IconButton onClick={onClick}><ArrowBackIcon/></IconButton>
    }
}