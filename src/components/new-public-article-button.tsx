import { ArticleIcon } from "./icons";
import { WriteButtonButton } from "./write-button";


export const NewTopicButton = ({onClick}: {onClick: () => void}) => {
    
    const infoText = <div><p className="font-bold">Un tema de discusión</p> Una vez creado cualquiera puede editar su contenido informativo y se empiezan a reunir todas las publicaciones sobre eso en la página del tema. Aparece en el panel deslizante de <span className="italic">En discusión</span>.</div>

    return <>
        <WriteButtonButton
            onClick={() => {
                onClick()
            }}
            name="Nuevo tema"
            infoText={infoText}
            icon={<ArticleIcon/>}
        />
    </>
}