"use client"
import { useDrafts } from "../app/hooks/contents"
import { DraftButton } from "./draft-button"
import LoadingSpinner from "./loading-spinner"
 
export const DraftsPreview = () => {
    const {drafts, isLoading, isError} = useDrafts()
    if(isLoading){
        return <LoadingSpinner/>
    }
    if(isError || !drafts){
        return <></>
    }
    if(drafts.length == 0){
        return <div className="text-center mt-32 text-[var(--text-light)]">
            No tenés ningún borrador.
        </div>
    }
    return <div>
        {drafts.map(({id}, index: number) => {
            return <div key={index} className="py-4">
                <DraftButton draftId={id}/>
            </div>
        })}
    </div>
}