"use client"
import { createComment } from "@/actions/create-content";
import { updateEntityContent } from "@/actions/create-entity"
import { getEntityById } from "@/actions/get-entity";
import MarkdownContent from "@/components/editor/ckeditor-markdown-content";
import { useState } from "react"
import dynamic from 'next/dynamic';
import NeedAccountPopup from "@/components/need-account-popup";
import Feed from "@/components/feed";
import { getContentComments } from "@/actions/get-content";

const CommentEditor = dynamic(() => import('@/components/editor/comment-editor'), { ssr: false });
const MarkdownEditor = dynamic(() => import('@/components/editor/markdown-editor'), { ssr: false });


const EditableContent = ({ content, handleSave, onCancel }) => {
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


const ReadOnlyContent = ({ onEdit, content, user }) => {

    const EditButton = () => {
        return <button
            className="py-1 px-4 rounded transition duration-200 bg-gray-200 hover:bg-gray-300 cursor-pointer"
            onClick={onEdit}>
            Editar
        </button>
    }

    return <>
        <div className="flex justify-center items-center px-2 py-2">
            {user ? <EditButton /> :
                <NeedAccountPopup trigger={EditButton()} text="Para editar el contenido es necesario tener una cuenta" />
            }
        </div>

        <div className="px-2">
            <MarkdownContent content={content} />
        </div>
    </>
}


const EntityCommentSection = ({ entity, user }) => {
    const handleSubmit = async (content) => {
        await createComment(content, entity.content.id)
    }

    return <div>
        <div>Comentarios</div>
        <div className="z-0">
            <CommentEditor onSubmit={handleSubmit} user={user} />
        </div>
        <Feed contents={entity.content.childrenComments} />
    </div>
}


const EntityPage = ({ entity, user }) => {
    const [content, setContent] = useState(entity.content.text)
    const [modify, setModify] = useState(false)

    const handleSave = async (content) => {
        await updateEntityContent(content, entity.id)
        setContent(content)
        setModify(false)
    }

    const onEdit = () => {
        if (user)
            setModify(!modify)
        else {
            ;
        }
    }

    return <>
        <h2 className="ml-2 py-8">
            {entity.name}
        </h2>

        <div className="mb-2">
            {modify ?
                <EditableContent onCancel={() => { setModify(!modify) }} content={content} handleSave={handleSave} />
                :
                <ReadOnlyContent onEdit={onEdit} content={content} user={user} />
            }
        </div>

        <hr />
        <EntityCommentSection entity={entity} user={user} />
    </>
}

export default EntityPage