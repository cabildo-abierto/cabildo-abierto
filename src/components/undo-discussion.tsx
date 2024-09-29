import { ContentProps, EntityProps } from "../app/lib/definitions"
import { Authorship, UserIdLink } from "./content"



export const UndoDiscussion = ({content, entity, version}: {content: ContentProps, entity: EntityProps, version: number}) => {
    return <div className="content-container p-2">
        <h3>Versión deshecha</h3>
        <div>
            Fue escrita por <UserIdLink id={content.author.id}/> y deshecha por <UserIdLink id={entity.versions[version].undos[0].authorId}/>.
        </div>
        <div className="">
            Calificada como vandalismo: {entity.versions[version].undos[0].reportsVandalism ? "sí" : "no"}.
        </div>
        <div>
            Motivo:
        </div>
        <div className="content">
        <blockquote>
            {entity.versions[version].undos[0].text}
        </blockquote>
        </div>
    </div>
}