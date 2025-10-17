import {OptionsDropdownButton} from "@/components/layout/options/options-dropdown-button";
import EnDiscusionIcon from "@/components/layout/icons/en-discusion-icon";
import {getCollectionFromUri, getDidFromUri, getRkeyFromUri, isArticle, isPost, splitUri} from "@/utils/uri";
import {useSession} from "@/queries/getters/useSession";
import {useState} from "react";
import {QueryContentUpdater, updateContentInQueries} from "@/queries/mutations/updates";
import { post } from "@/utils/fetch";
import {QueryClient, useQueryClient} from "@tanstack/react-query";
import {ArCabildoabiertoFeedDefs} from "@/lex-api"



export function canBeEnDiscusion(c: string) {
    return isPost(c) || isArticle(c)
}


const addToEnDiscusion = async (uri: string) => {
    const {collection, rkey} = splitUri(uri)
    return await post(`/set-en-discusion/${collection}/${rkey}`)
}


const removeFromEnDiscusion = async (uri: string) => {
    const {collection, rkey} = splitUri(uri)
    return await post(`/unset-en-discusion/${collection}/${rkey}`)
}



function optimisticRemoveContentFromEnDiscusion(uri: string, qc: QueryClient) {
    const updater: QueryContentUpdater<ArCabildoabiertoFeedDefs.FeedViewContent["content"]> = p => null
    updateContentInQueries(qc, uri, updater, qc => qc[0] == "main-feed" && qc[1] == "discusion")
}


export const OptionsEnDiscusionButton = ({uri, enDiscusion}: {
    uri: string
    enDiscusion: boolean
}) => {
    const {user} = useSession()
    const authorDid = getDidFromUri(uri)
    const [addedToEnDiscusion, setAddedToEnDiscusion] = useState<boolean>(enDiscusion)
    const isAuthor = user && user.did == authorDid
    const isOptimistic = getRkeyFromUri(uri).startsWith("optimistic")
    const collection = getCollectionFromUri(uri)
    const qc = useQueryClient()

    return isAuthor && canBeEnDiscusion(collection) && <OptionsDropdownButton
        handleClick={async () => {
            if (!addedToEnDiscusion) {
                const {error} = await addToEnDiscusion(uri)
                if(!error){
                    setAddedToEnDiscusion(true)
                } else {
                    return {error}
                }
            } else {
                optimisticRemoveContentFromEnDiscusion(uri, qc)
                const {error} = await removeFromEnDiscusion(uri)
                if(!error){
                    setAddedToEnDiscusion(false)
                } else {
                    return {error}
                }
            }
            return {}
        }}
        startIcon={<EnDiscusionIcon/>}
        text1={!addedToEnDiscusion ? "Agregar a En discusión" : "Retirar de En discusión"}
        disabled={isOptimistic}
    />
}