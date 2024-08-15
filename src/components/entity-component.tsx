import React from "react"
import Link from "next/link";

import dynamic from "next/dynamic";

const WikiEditor = dynamic( () => import( '@/components/editor/wiki-editor' ), { ssr: false } );


const EntityComponent: React.FC<any> = ({ content, entity, user, contents}) => {
    const EditButton: React.FC<any> = () => {
        return <Link href={"/wiki/"+entity.id+"/edit"}>
            <button
                className="gray-btn"
            >
                Editar
            </button>
        </Link>
    }

    /*let editButton = <></>
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
        editButton = <EditButton onClick={() => {}}/>
    } else {
        editButton = <Popup
            Panel={NeedPermissionsPopupPanel}
            Trigger={EditButton}
        />
    }*/

    return <>
        <div className="flex justify-end items-center px-2 py-2">
            <EditButton/>
        </div>

        <div className="px-2 min-h-64">
            <WikiEditor 
                initialData={content.text == "" ? "Este artículo está vacío!" : content.text}
                readOnly={true}
                content={content}
                entityId={entity.id}
                user={user}
                contents={contents}
            />
        </div>
        <hr className="mb-8 mt-4"/>
    </>
}

export default EntityComponent