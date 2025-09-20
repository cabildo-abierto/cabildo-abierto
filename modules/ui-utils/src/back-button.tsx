import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {IconButton} from "@/../modules/ui-utils/src/icon-button"
import {useRouter} from "next/navigation";

import {Color} from "./color";

export const BackButton = ({onClick, defaultURL, preferReferrer=true, size="medium", color="background"}: {
    preferReferrer?: boolean,
    size?: "small" | "medium" | "large"
    defaultURL?: string
    onClick?: () => void
    color?: Color
}) => {
    const router = useRouter()

    const handleClick = () => {
        if(onClick) {
            onClick()
        } else if (preferReferrer && document.referrer && new URL(document.referrer).origin != window.location.origin) {
            router.push(defaultURL)
        } else if(preferReferrer){
            router.back()
        } else {
            router.push(defaultURL)
        }
    }

    return (
        <IconButton sx={{borderRadius: 0}} size={size} color={color} onClick={handleClick}>
            <ArrowBackIcon fontSize={"inherit"} color={"inherit"}/>
        </IconButton>
    )
}