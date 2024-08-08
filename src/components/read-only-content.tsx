import MarkdownContent from "./editor/markdown-content"
import Link from "next/link";


const ReadOnlyContent: React.FC<any> = ({ content, entity }) => {
    const EditButton: React.FC<any> = () => {
        return <Link href={"/wiki/"+entity.id+"/edit"}>
            <button
                className="py-1 px-4 rounded transition duration-200 bg-gray-200 hover:bg-gray-300 cursor-pointer"
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
        <div className="flex justify-center items-center px-2 py-2">
            <EditButton/>
        </div>

        <div className="px-2 min-h-64">
            <MarkdownContent content={content.text == "" ? "Este artículo está vacío!" : content.text} />
        </div>
    </>
}

export default ReadOnlyContent