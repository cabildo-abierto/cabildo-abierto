import { useEffect, useState } from "react";
import { FastPostIcon } from "./icons";
import InfoPanel from "./info-panel";
import { CreateFastPostModal } from "./create-fast-post-modal";
import { isIOS } from 'react-device-detect'
import { useRouter } from "next/navigation";
import { WriteButtonButton } from "./write-button";


export const NewFastPostButton = ({onClick}: {onClick: () => void}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter()
  
    const handleClick = () => {
        if(!isIOS){
            setIsModalOpen(true);
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
    {isModalOpen && <CreateFastPostModal onClose={() => setIsModalOpen(false)} />}
    </>
}