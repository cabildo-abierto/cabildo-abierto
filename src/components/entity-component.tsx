import React from "react"
import Link from "next/link";

import dynamic from "next/dynamic";
import { ContentProps, EntityProps } from "src/app/lib/definitions";


const WikiEditor = dynamic( () => import( 'src/components/editor/wiki-editor' ), { ssr: false } );

type EntityComponentProps = {
    version: number,
    entity: EntityProps,
    showingChanges?: boolean
}

const EntityComponent: React.FC<EntityComponentProps> = ({ entity, version, showingChanges = false}) => {

    return <>
        <div className="px-2 min-h-64">
            <WikiEditor 
                readOnly={true}
                version={version}
                entity={entity}
                showingChanges={showingChanges}
            />
        </div>
    </>
}

export default EntityComponent