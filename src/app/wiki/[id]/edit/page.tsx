import React from "react"
import { ThreeColumnsLayout } from "@/components/main-layout";
import NoEntityPage from "../no-entity-page";
import { ContentWithComments } from "@/components/content-with-comments";
import PaywallChecker from "@/components/paywall-checker";
import { getContentsMap, getEntitiesMap } from "@/components/update-context";
import { getUser, UserProps } from "@/actions/get-user";
import { SetProtectionButton } from "@/components/protection-button";
import Link from "next/link";
import { validSubscription } from "@/components/utils";
import dynamic from "next/dynamic";
import { updateContent } from "@/actions/create-content";

const MarkdownEditor = dynamic(() => import('@/components/editor/markdown-editor'), { ssr: false });


function hasEditPermissions(user: UserProps, level: string) {
    return user.editorStatus == "Administrator" || level != "Administrator"
}

const EntityPage: React.FC<any> = async ({ params }) => {
    const entities = await getEntitiesMap()
    const contents = await getContentsMap()
    const user = await getUser()

    const entity = entities[params.id]

    if (!entity) {
        return <ThreeColumnsLayout center={<NoEntityPage id={params.id} />} />
    }

    let editableContent = <></>

    if (user) {
        if (validSubscription(user)) {
            if (hasEditPermissions(user, entity.protection)) {
                editableContent = <>
                    {(user && user.editorStatus == "Administrator") &&
                        <div className="flex justify-center">
                            <SetProtectionButton entity={entity} />
                        </div>
                    }
                    <MarkdownEditor
                        initialData={contents[entity.contentId].text}
                        contentId={entity.contentId}
                        entityId={entity.id}
                    />
                </>
            } else {
                editableContent = <>
                    <h3 className="flex justify-center mt-16">No tenés los permisos suficientes para editar este artículo</h3>
                    <Link className="flex justify-center mt-16" href={"/wiki/" + params.id}>
                        <button className="gray-btn">Volver al artículo</button>
                    </Link>
                </>
            }
        } else {
            editableContent = <>
                <h3 className="flex justify-center mt-16">Necesitás una suscripción para editar</h3>
                <Link className="flex justify-center mt-16" href={"/wiki/" + params.id}>
                    <button className="gray-btn">Volver al artículo</button>
                </Link>
            </>
        }
    } else {
        editableContent = <>
            <h3 className="flex justify-center mt-16">Necesitás una cuenta para editar</h3>
            <Link className="flex justify-center mt-16" href={"/wiki/" + params.id}>
                <button className="gray-btn">Volver al artículo</button>
            </Link>
        </>
    }

    const center = <div className="bg-white h-full">
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