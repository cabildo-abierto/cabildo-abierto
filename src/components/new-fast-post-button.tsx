import { useEffect, useState } from "react";
import { FastPostIcon } from "./icons";
import InfoPanel from "./info-panel";
import { CreateFastPostModal } from "./create-fast-post-modal";
import { isIOS } from 'react-device-detect'
import { useRouter } from "next/navigation";


export const NewFastPostButton = ({onClick, className="", textClassName="", infoPanelIconClassName="text-white", showInfoPanel=true, text}: {onClick: () => void, className?: string, textClassName?: string, infoPanelIconClassName?: string, showInfoPanel?: boolean, text?: string}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter()
  
    return <>
        <button
            onClick={() => {
                if(!isIOS){
                    setIsModalOpen(true);
                    onClick()
                } else {
                    router.push("/escribir/rapida")
                }
            }}
            className={
                "flex justify-between items-center " + className
            }
        >
        <div className={"flex " + textClassName} >
            
            {text ? <span>{text}</span> : <><span className="px-1">
                <FastPostIcon />
            </span>
            
            <span>Publicación rápida</span>
            </>
            }
        </div>

        {showInfoPanel && <InfoPanel
            iconClassName={infoPanelIconClassName}
            className="w-64"
            text="Caracteres y formato limitados. Sin título."
        />}
    </button>
    {isModalOpen && <CreateFastPostModal onClose={() => setIsModalOpen(false)} />}
    </>
}