import { useState } from "react";
import InfoPanel from "./info-panel";
import { ArticleIcon } from "./icons";
import { CreateArticleModal } from "./create-article-modal";


export const NewPublicArticleButton = ({onClick, className="", textClassName="", infoPanelIconClassName="text-white", showInfoPanel=true, text}: {onClick: () => void, className?: string, textClassName?: string, infoPanelIconClassName?: string, showInfoPanel?: boolean, text?: string}) => {
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
                <ArticleIcon />
            </span>
            
            <span>Nuevo tema</span>
            </>
            }
        </div>

        {showInfoPanel && <InfoPanel
            iconClassName={infoPanelIconClassName}
            className="w-64"
            text="Un tema de discusión. Cualquiera puede editar su contenido."
        />}
    </button>
    {isModalOpen && <CreateArticleModal onClose={() => setIsModalOpen(false)} />}
    </>
}