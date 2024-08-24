import React from "react"
import Link from "next/link";

import dynamic from "next/dynamic";
import { ContentProps, EntityProps } from "@/app/lib/definitions";


const WikiEditor = dynamic( () => import( '@/components/editor/wiki-editor' ), { ssr: false } );


const EntityComponent: React.FC<{content: ContentProps, entity: EntityProps}> = ({ content, entity}) => {

    return <>
        <div className="px-2 min-h-64">
            <WikiEditor 
                readOnly={true}
                contentId={content.id}
                entity={entity}
            />
        </div>
    </>
}

export default EntityComponent