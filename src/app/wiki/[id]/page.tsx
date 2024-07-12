import { EntityProps, getEntityById } from "@/actions/get-entity";
import React from "react"
import EntityPage from "./entity-page";
import { ThreeColumnsLayout } from "@/components/main-layout";
import { getUser } from "@/actions/get-user";

const Tema: React.FC = async ({params}) => {
    const user = await getUser()

    const entity: EntityProps | null = await getEntityById(params.id)
    if(!entity){
        return <>Entidad no encontrada.</>
    }

    const center = <div className="bg-white h-full">
        <EntityPage entity={entity} user={user}/>
    </div>

    return <ThreeColumnsLayout center={center}/>
}

export default Tema