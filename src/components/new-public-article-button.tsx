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
            text={<div><p className="font-bold">Un tema de discusión</p> Una vez creado cualquiera puede editar su contenido informativo y se empiezan a reunir todas las publicaciones sobre eso en la página del tema. Aparece en el panel deslizante de <span className="italic">En discusión</span></div>}
        />}
    </button>
    {isModalOpen && <CreateArticleModal onClose={() => setIsModalOpen(false)} />}
    </>
}