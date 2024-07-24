"use client"
import { updateEntityContent } from "@/actions/create-entity"
import MarkdownContent from "@/components/editor/ckeditor-markdown-content";
import React, { useState } from "react"
import dynamic from 'next/dynamic';
import { useUser } from "./user-provider";
import { setProtection } from "@/actions/protection";
import { validSubscription } from "./utils";
import { UserProps } from "@/actions/get-user";
import NeedAccountPopupPanel from "@/components/need-account-popup";
import Popup from "./popup";
import NeedPermissionsPopupPanel from "./need-permissions-popup";
import NeedSubscriptionPopupPanel from "./need-subscription-popup";

const MarkdownEditor = dynamic(() => import('@/components/editor/markdown-editor'), { ssr: false });


const EditableContent: React.FC<any> = ({ content, handleSave, onCancel }) => {
    return <>
        <div className="flex justify-center items-center px-2 py-2">
            <button
                className="ml-3 py-2 px-4 rounded transition duration-200 bg-gray-200 hover:bg-gray-300 cursor-pointer"
                onClick={onCancel}>
                Cancelar edición
            </button>
        </div>

        <div className="px-2">
            <MarkdownEditor initialData={content} onSubmit={handleSave} />
        </div>
    </>
}


function protectionToName(protection: string){
    if(protection == "Administrator") {
        return "Administrador"
    } else {
        return "Sin protección"
    }
}

function hasEditPermissions(user: UserProps, level: string){
    return user.editorStatus == "Administrator" || level != "Administrator"
}

const ReadOnlyContent: React.FC<any> = ({ onEdit, content, entity }) => {
    const {user} = useUser()
    const [protection, setProtectionState] = useState(entity.protection)
    const administrator = user && user.editorStatus == "Administrator"

    const EditButton: React.FC<any> = ({onClick}) => {
        return <button
            className="py-1 px-4 rounded transition duration-200 bg-gray-200 hover:bg-gray-300 cursor-pointer"
            onClick={onClick}>
            Editar
        </button>
    }

    const otherProtection = protection == "Administrator" ? "Unprotected" : "Administrator"

    const SetProtectionButton = () => {
        return <button
            className="py-1 px-4 rounded transition duration-200 bg-gray-200 hover:bg-gray-300 cursor-pointer"
            onClick={async () => {await setProtection(entity.id, otherProtection); setProtectionState(otherProtection)}}>
            Cambiar protección a {protectionToName(otherProtection)}
        </button>
    }

    let editButton = <></>
    if(!user){
        editButton = <Popup
            Panel={NeedAccountPopupPanel}
            Trigger={EditButton}
        />
    } else if(!validSubscription(user)) {
        editButton = <Popup
            Panel={NeedSubscriptionPopupPanel}
            Trigger={EditButton}
        />
    } else if(hasEditPermissions(user, protection)){
        editButton = <EditButton onClick={onEdit}/>
    } else {
        editButton = <Popup
            Panel={NeedPermissionsPopupPanel}
            Trigger={EditButton}
        />
    }

    return <>
        <div className="flex justify-center items-center px-2 py-2">
            {editButton}
            <div className="px-2">
                {administrator ? <SetProtectionButton/> : <></>}
            </div>
        </div>

        {!administrator && <div className="text-gray-600">Nivel de protección: {protectionToName(protection)}</div>}

        <div className="px-2 min-h-64">
            <MarkdownContent content={content == "" ? "Este artículo está vacío!" : content} />
        </div>
    </>
}

const EntityComponent: React.FC<any> = ({ content, entity}) => {
    const [updatedContent, setUpdatedContent] = useState(content.text)
    const [modify, setModify] = useState(false)

    const handleSave = async (newText: string) => {
        await updateEntityContent(newText, content.id)
        setUpdatedContent(newText)
        setModify(false)
    }

    const onEdit = () => {
        setModify(!modify)
    }

    return <>
        {modify ? <EditableContent onCancel={() => { setModify(!modify) }} content={updatedContent} handleSave={handleSave} /> : 
        <ReadOnlyContent onEdit={onEdit} content={updatedContent} entity={entity}/>}
        <hr className="mb-8 mt-4"/>
    </>
}

export default EntityComponent