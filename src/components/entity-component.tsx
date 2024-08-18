import React from "react"
import Link from "next/link";

import dynamic from "next/dynamic";
import { ContentProps, EntityProps } from "@/app/lib/definitions";


const WikiEditor = dynamic( () => import( '@/components/editor/wiki-editor' ), { ssr: false } );


const EntityComponent: React.FC<{content: ContentProps, entity: EntityProps}> = ({ content, entity}) => {
    const EditButton: React.FC<any> = () => {
        return <Link href={"/articulo/"+entity.id+"/edit"}>
            <button
                className="gray-btn"
            >
                Editar
            </button>
        </Link>
    }

    return <>
        <div className="flex justify-end items-center px-2 py-2">
            <EditButton/>
        </div>

        <div className="px-2 min-h-64">
            <WikiEditor 
                readOnly={true}
                contentId={content.id}
                entity={entity}
            />
        </div>
        <hr className="mb-8 mt-4"/>
    </>
}

export default EntityComponent