import { useState } from "react";
import InfoPanel from "./info-panel";
import { ArticleIcon } from "./icons";
import { CreateArticleModal } from "./create-article-modal";



export const NewPublicArticleButton = ({onClick, className="", textClassName="", infoPanelIconClassName="text-white", showInfoPanel=true}: {onClick: () => void, className?: string, textClassName?: string, infoPanelIconClassName?: string, showInfoPanel?: boolean}) => {
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
            <span className="px-1">
                <ArticleIcon />
            </span>
            
            <span>Artículo público</span>
            
        </div>

        {showInfoPanel && <InfoPanel
            iconClassName={infoPanelIconClassName}
            className="w-64"
            text="Un artículo sobre algún tema de interés público. Cualquiera lo puede editar."
        />}
    </button>
    {isModalOpen && <CreateArticleModal onClose={() => setIsModalOpen(false)} />}
    </>
}