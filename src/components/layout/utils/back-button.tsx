import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {IconButton} from "@/components/layout/utils/icon-button"
import {useRouter} from "next/navigation";

import {Color} from "./color";

export const BackButton = ({onClick, defaultURL, behavior="ca-back", size="medium", color="background"}: {
    behavior?: "ca-back" | "true-back" | "fixed",
    size?: "small" | "medium" | "large"
    defaultURL?: string
    onClick?: () => void
    color?: Color
}) => {
    const router = useRouter()

    // Al apretar el back button hay tres opciones:
    // true-back Funciona como un back del navegador
    // fixed Navegamos al default URL
    // ca-back Funciona como un back salvo que sea hacia afuera de la página, en ese caso se usa default url

    const handleClick = () => {
        if(onClick) {
            onClick()
        }

        if(behavior == "true-back"){
            router.back()
        } else if(behavior == "fixed" && defaultURL){
            router.push(defaultURL)
        } else {
            const outsideReferrer = document.referrer && new URL(document.referrer).origin != window.location.origin
            if(outsideReferrer){
                router.push(defaultURL)
            } else {
                router.back()
            }
        }
    }

    return (
        <IconButton sx={{borderRadius: 0}} size={size} color={color} onClick={handleClick}>
            <ArrowBackIcon fontSize={"inherit"} color={"inherit"}/>
        </IconButton>
    )
}