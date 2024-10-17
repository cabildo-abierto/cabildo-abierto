import { useState } from "react";
import { ArticleIcon, FastPostIcon } from "./icons";
import InfoPanel from "./info-panel";
import { CreateArticleModal } from "./create-article-modal";
import { CreateFastPostModal } from "./create-fast-post-modal";


export const NewFastPostButton = ({onClick, className="", textClassName="", infoPanelIconClassName="text-white", showInfoPanel=true, text}: {onClick: () => void, className?: string, textClassName?: string, infoPanelIconClassName?: string, showInfoPanel?: boolean, text?: string}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    return <>
        <button
            onClick={() => {
                setIsModalOpen(true);
                onClick()
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