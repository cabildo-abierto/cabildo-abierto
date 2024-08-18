"use client"

import React from "react"
import { ThreeColumnsLayout } from "@/components/three-columns";
import NoEntityPage from "../../../../components/no-entity-page";
import PaywallChecker from "@/components/paywall-checker";
import { SetProtectionButton } from "@/components/protection-button";
import Link from "next/link";
import { entityLastVersionId, validSubscription } from "@/components/utils";
import dynamic from "next/dynamic";
import { useUser } from "@/app/hooks/user";
import { useEntity } from "@/app/hooks/entities";
import { UserProps } from "@/app/lib/definitions";

const WikiEditor = dynamic(() => import('@/components/editor/wiki-editor'), { ssr: false });


function hasEditPermissions(user: UserProps, level: string) {
    return user.editorStatus == "Administrator" || level != "Administrator"
}

const EntityPage: React.FC<any> = ({ params }) => {
    const {entity, isLoading, isError} = useEntity(params.id)
    const user = useUser()

    if (isLoading || user.isLoading) {
        return <></>
    }
    if(isError || !entity){
        return <ThreeColumnsLayout center={<NoEntityPage id={params.id} />} />
    }

    let editableContent = <></>

    if (user) {
        if (validSubscription(user.user)) {
            if (user.user && hasEditPermissions(user.user, entity.protection)) {
                editableContent = <>
                    {(user.user && user.user.editorStatus == "Administrator") &&
                        <div className="flex justify-center py-2">
                            <SetProtectionButton entity={entity} />
                        </div>
                    }
                    <div className="mb-32">
                        <WikiEditor
                            contentId={entityLastVersionId(entity)}
                            entity={entity}
                        />
                    </div>
                </>
            } else {
                editableContent = <>
                    <h3 className="flex justify-center mt-16">No tenés los permisos suficientes para editar este artículo</h3>
                    <Link className="flex justify-center mt-16" href={"/articulo/" + params.id}>
                        <button className="gray-btn">Volver al artículo</button>
                    </Link>
                </>
            }
        } else {
            editableContent = <>
                <h3 className="flex justify-center mt-16">Necesitás una suscripción para editar</h3>
                <Link className="flex justify-center mt-16" href={"/articulo/" + params.id}>
                    <button className="gray-btn">Volver al artículo</button>
                </Link>
            </>
        }
    } else {
        editableContent = <>
            <h3 className="flex justify-center mt-16">Necesitás una cuenta para editar</h3>
            <Link className="flex justify-center mt-16" href={"/articulo/" + params.id}>
                <button className="gray-btn">Volver al artículo</button>
            </Link>
        </>
    }

    const center = <div className="">
        <h1 className="ml-2 py-8">
            {entity.name}
        </h1>
        {editableContent}
    </div>

    if (entity.isPublic) {
        return <ThreeColumnsLayout center={center} />
    } else {
        return <PaywallChecker>
            <ThreeColumnsLayout center={center} />
        </PaywallChecker>
    }
}

export default EntityPage