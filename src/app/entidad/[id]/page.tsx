import { EntityProps, getEntityById } from "@/actions/get-entity";
import React from "react"
import EntityPage from "./entity-page";

const Tema: React.FC = async ({params}) => {

    const entity: EntityProps | null = await getEntityById(params.id)
    if(!entity){
        return <>Entidad no encontrada.</>
    }

    return <div className="mx-auto max-w-4xl bg-white h-full">
        <EntityPage entity={entity}/>
    </div>
}

export default Tema