import { EntityProps, getEntityById } from "@/actions/get-entity";
import MyEditor from "@/app/escribir/editor";
import { ReadOnlyEditor } from "@/app/escribir/readonly_editor";
import React from "react"
import EntityPage from "./entity_page";

const Tema: React.FC = async ({params}) => {
    const entity: EntityProps | null = await getEntityById(params.id)
    if(!entity){
        return <>Entidad no encontrada.</>
    }
    console.log(entity)

    return <div className="mx-auto max-w-4xl bg-white border-l border-r h-full">
        <EntityPage entity={entity}/>
    </div>
}

export default Tema