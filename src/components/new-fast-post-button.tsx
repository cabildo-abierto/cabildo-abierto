import { FastPostIcon } from "./icons";
import { isMobile } from 'react-device-detect'
import { useRouter } from "next/navigation";
import { WriteButtonButton } from "./write-button";


export const NewFastPostButton = ({onClick}: {onClick: () => void}) => {
    const router = useRouter()
  
    const handleClick = () => {
        if(!isMobile){
            onClick()
        } else {
            router.push("/escribir/rapida")
        }
    }

    const infoText = <div><p className="font-bold">Cortita y al pie</p>Máximo 800 caracteres y formato limitado. Sin título. Va a aparecer en el muro.</div>

    return <>
        <WriteButtonButton
            onClick={handleClick}
            name="Publicación rápida"
            icon={<FastPostIcon/>}
            infoText={infoText}
        />
    </>
}