import {BaseIconButton} from "@/components/layout/base/base-icon-button"
import {useRouter} from "next/navigation";
import {ArrowLeftIcon} from "@phosphor-icons/react";

export const BackButton = ({onClick, defaultURL, behavior="ca-back", size="default", className}: {
    behavior?: "ca-back" | "true-back" | "fixed"
    size?: "small" | "default" | "large"
    defaultURL?: string
    onClick?: () => void
    className?: string
}) => {
    const router = useRouter()

    // Al apretar el back button hay tres opciones:
    // true-back Funciona como un back del navegador
    // fixed Navegamos al default URL
    // ca-back Funciona como un back salvo que sea hacia afuera de la página, en ese caso se usa default url

    const handleClick = () => {
        if(onClick) {
            onClick()
            return
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
        <BaseIconButton
            size={size}
            className={className}
            onClick={handleClick}
        >
            <ArrowLeftIcon/>
        </BaseIconButton>
    )
}