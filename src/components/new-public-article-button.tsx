import { useState } from "react";
import InfoPanel from "./info-panel";
import { ArticleIcon } from "./icons";
import { CreateArticleModal } from "./create-article-modal";
import { WriteButtonButton } from "./write-button";


export const NewPublicArticleButton = ({onClick}: {onClick: () => void}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const infoText = <div><p className="font-bold">Un tema de discusión</p> Una vez creado cualquiera puede editar su contenido informativo y se empiezan a reunir todas las publicaciones sobre eso en la página del tema. Aparece en el panel deslizante de <span className="italic">En discusión</span></div>

    return <>
        <WriteButtonButton
            onClick={() => {
                setIsModalOpen(true);
                onClick()
            }}
            name="Nuevo tema"
            infoText={infoText}
            icon={<ArticleIcon/>}
        />
        {isModalOpen && <CreateArticleModal onClose={() => setIsModalOpen(false)} />}
    </>
}