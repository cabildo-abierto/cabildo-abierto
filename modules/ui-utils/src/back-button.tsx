import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {IconButton} from "@/../modules/ui-utils/src/icon-button"
import {useRouter} from "next/navigation";

export const BackButton = ({onClick, defaultURL, preferReferrer=true, size="medium"}: {
    preferReferrer?: boolean, size?: "small" | "medium" | "large"
    defaultURL?: string
    onClick?: () => void
}) => {
    const router = useRouter()

    const handleClick = () => {
        if(onClick) {
            onClick()
        } else if (preferReferrer && document.referrer && new URL(document.referrer).origin != window.location.origin) {
            router.push(defaultURL)
        } else {
            router.back()
        }
    }

    return (
        <IconButton size={size} color={"inherit"} onClick={handleClick}>
            <ArrowBackIcon fontSize={"inherit"} color={"inherit"}/>
        </IconButton>
    )
}