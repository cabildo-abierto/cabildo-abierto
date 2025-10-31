import {QueryClient, useQueryClient} from "@tanstack/react-query";
import {getCollectionFromUri, splitUri} from "@/utils/uri";
import {QueryContentUpdater, updateContentInQueries} from "@/queries/mutations/updates";
import {ConfirmModal} from "@/components/layout/confirm-modal";
import {getCollectionWithArticle} from "./options-delete-button";
import {post} from "@/utils/fetch";
import {ArCabildoabiertoFeedDefs} from "@/lex-api";


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

export const ConfirmEnDiscusionModal = ({
                                            uri,
                                            onClose,
                                            open,
                                            enDiscusion
                                        }: {
    uri: string
    onClose: () => void
    open: boolean
    enDiscusion: boolean
}) => {
    const qc = useQueryClient()
    const collection = getCollectionFromUri(uri)

    async function onConfirm() {
        if (!enDiscusion) {
            const {error} = await addToEnDiscusion(uri)
            return {error}
        } else {
            optimisticRemoveContentFromEnDiscusion(uri, qc)
            const {error} = await removeFromEnDiscusion(uri)
            return {error}
        }
    }

    let title: string
    if (!enDiscusion) {
        title = `¿Agregar ${getCollectionWithArticle(collection)} a en discusión?`
    } else {
        title = `¿Sacar ${getCollectionWithArticle(collection)} de en discusión?`
    }

    let text: string
    if (!enDiscusion) {
        text = 'Se va a agregar el contenido al muro "En discusión" que aparece en la pantalla principal. Esta acción es reversible.'
    } else {
        text = 'El contenido va a dejar de aparecer para otros en el muro "En discusión". Esta acción es reversible.'
    }

    return <ConfirmModal
        title={title}
        text={text}
        open={open}
        onConfirm={onConfirm}
        onClose={onClose}
        confirmButtonClassName={"bg-[var(--background-dark)] hover:bg-[var(--background-dark2)]"}
    />
}