import { RedFlag } from "../icons/red-flag-icon"
import { WriteButtonIcon } from "../icons/write-button-icon"
import { ContentOptionsChoiceButton } from "./content-options-button"
import DeleteIcon from '@mui/icons-material/Delete';
import { ShareContentButton } from "./share-content-button"
import {FastPostProps, FeedContentProps} from "../../app/lib/definitions"
import {ReactNode} from "react";

export const ContentOptions = ({optionsList, content}: {optionsList: string[], content: any}) => {

    async function onReportFake(){
        /*setIsFakeNewsModalOpen(true)
        onClose()*/
        return {}
    }

    async function onEdit(){
        /*if(content.type == "Comment"){
            setIsEditModalOpen(true)
        } else {
            router.push(editContentUrl(content.id))
        }
        onClose()*/
        return {}
    }

    async function onDelete(){
        /*const result = await deleteContent(content.id, false)
        mutate("/api/content/"+content.id)
        if(content.parentContents && content.parentContents.length > 0){
            mutate("/api/content"+content.parentContents[0].id)
        }
        if(["Post", "FastPost"].includes(content.type) || (content.rootContent && ["Post", "FastPost"].includes(content.rootContent.type))){
            mutate("/api/feed/")
        }
        onClose()*/
        //return result
        return {}
    }

    return <div className="text-base border rounded bg-[var(--content)] p-2">
        {optionsList.includes("reportFake") &&
            <ContentOptionsChoiceButton
                onClick={onReportFake}
                icon={<RedFlag/>}
            >
                <div className="whitespace-nowrap">Reportar información falsa</div>
            </ContentOptionsChoiceButton>}

        {false && optionsList.includes("edit") && <ContentOptionsChoiceButton
            onClick={onEdit}
            icon={<WriteButtonIcon/>}
        >
            Editar
        </ContentOptionsChoiceButton>}
        {optionsList.includes("delete") && <ContentOptionsChoiceButton
            onClick={onDelete}
            icon={<DeleteIcon/>}
        >
            Eliminar
        </ContentOptionsChoiceButton>}

        {optionsList.includes("share") && <ShareContentButton content={content}/>}

    </div>
}

export const ContentOptionsDropdown = ({
    options
}: {
    options: ReactNode
}) => {
    return <div className="text-base border rounded bg-[var(--content)] p-2">
        {options}
    </div>
}