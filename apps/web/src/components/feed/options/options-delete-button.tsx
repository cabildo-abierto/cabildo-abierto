import {post} from "../../utils/react/fetch";
import {
    getCollectionFromUri, getRkeyFromUri,
    isArticle,
    isDataset,
    isPost,
    isTopicVersion,
    splitUri
} from "@cabildo-abierto/utils";
import {QueryClient, useMutation, useQueryClient} from "@tanstack/react-query";
import {
    contentQueriesFilter, invalidateQueries,
    updateContentInQueries,
    updateDatasets,
    updateTopicHistories
} from "@/queries/mutations/updates";
import {TrashIcon} from "@phosphor-icons/react";
import {ConfirmModal} from "../../utils/dialogs/confirm-modal";
import {useErrors} from "@/components/layout/contexts/error-context";
import {AppBskyFeedPost} from "@atproto/api";
import {DropdownMenuItem} from "@/components/utils/ui/dropdown-menu";
import {useSession} from "@/components/auth/use-session";
import {DraftPreview} from "@cabildo-abierto/api";


const collection2displayText = {
    "ar.com.cabildoabierto.visualization": "visualización",
    "app.bsky.feed.post": "publicación",
    "ar.com.cabildoabierto.article": "artículo",
    "ar.com.cabildoabierto.quotePost": "respuesta",
    "ar.com.cabildoabierto.topic": "versión",
    "ar.cabildoabierto.wiki.topicVersion": "versión",
    "ar.com.cabildoabierto.dataset": "conjunto de datos",
    "ar.cabildoabierto.feed.article": "artículo",
    "ar.cabildoabierto.data.dataset": "conjunto de datos"
}

function optimisticDelete(qc: QueryClient, uri: string) {
    updateContentInQueries(qc, uri, c => null)
    updateTopicHistories(qc, uri, e => null)
    updateDatasets(qc, uri, e => null)
    qc.setQueryData(["drafts"], drafts => (drafts as DraftPreview[])?.filter(d => d.id != getRkeyFromUri(uri)))
}

const deleteRecord = async ({uri}: { uri: string }) => {
    const {collection, rkey} = splitUri(uri)
    return post(`/delete-record/${collection}/${rkey}`)
}


function getDeleteContentMessage(collection: string) {
    if (isPost(collection)) {
        return "Si eliminás la publicación, no vas a poder recuperarla."
    } else if (isArticle(collection)) {
        return "Si eliminás el artículo, no vas a poder recuperarlo."
    } else if (isTopicVersion(collection)) {
        return "Si eliminás la edición, no vas a poder recuperarla."
    } else if (isDataset(collection)) {
        return "Si eliminás el conjunto de datos, no vas a poder recuperarlo."
    } else if(collection == "draft") {
        return "Si lo eliminás, no vas a poder recuperarlo."
    } else {
        return "Si eliminás el contenido, no vas a poder recuperarlo."
    }
}

export function getCollectionWithArticle(collection: string) {
    if (isPost(collection)) {
        return "la publicación"
    } else if (isArticle(collection)) {
        return "el artículo"
    } else if (isTopicVersion(collection)) {
        return "la edición"
    } else if (isDataset(collection)) {
        return "el conjunto de datos"
    } else if(collection == "draft") {
        return "el borrador"
    } else {
        return "el contenido"
    }
}


function invalidateQueriesAfterDeleteSuccess(uri: string, qc: QueryClient, reply?: AppBskyFeedPost.ReplyRef) {
    const queriesToInvalidate: string[][] = []
    if (reply) {
        const parentCollection = getCollectionFromUri(reply.parent.uri)
        const rootCollection = getCollectionFromUri(reply.root.uri)

        if (isTopicVersion(rootCollection)) {
            const tvUri = reply.root.uri
            const {did, rkey} = splitUri(tvUri)

            queriesToInvalidate.push(["topic"])
            queriesToInvalidate.push(["topic-history"])
            queriesToInvalidate.push(["topic", did, rkey])
            queriesToInvalidate.push(["topic-version", did, rkey])
            queriesToInvalidate.push(["votes", tvUri])
            queriesToInvalidate.push(["topic-discussion", tvUri])
        }

        if (isArticle(parentCollection) || isPost(parentCollection)) {
            queriesToInvalidate.push(["thread", reply.parent.uri])
        }
    }

    const collection = getCollectionFromUri(uri)
    if(collection == "draft") {
        const id = getRkeyFromUri(uri)
        queriesToInvalidate.push(["drafts"])
        queriesToInvalidate.push(["draft", id])
    }

    invalidateQueries(qc, queriesToInvalidate)
}


export const ConfirmDeleteModal = ({
                                       uri,
                                       reply,
                                       onClose,
                                       open
                                   }: {
    uri?: string
    reply?: AppBskyFeedPost.ReplyRef
    onClose: () => void
    open: boolean
}) => {
    const qc = useQueryClient()
    const collection = getCollectionFromUri(uri)
    const {addError} = useErrors()

    const deleteMutation = useMutation({
        mutationFn: deleteRecord,
        onMutate: (content) => {
            try {
                optimisticDelete(qc, content.uri)
                qc.cancelQueries(contentQueriesFilter(uri))
            } catch (err) {
                console.log("Error on mutate", uri)
                console.log(err)
            }
        },
        onSuccess: async (res) => {
            if(res.error) addError(res.error)
            invalidateQueriesAfterDeleteSuccess(uri, qc, reply)
        },
        onError: () => {
            addError("Algo salió mal")
        }
    })

    return <ConfirmModal
        title={`¿Querés borrar ${getCollectionWithArticle(collection)}?`}
        text={getDeleteContentMessage(collection)}
        open={open}
        onConfirm={async () => {
            deleteMutation.mutate({uri})
            return {}
        }}
        onClose={onClose}
        confirmButtonVariant={"error"}
        confirmButtonText={"Borrar"}
    />
}


const OptionsDeleteButton = ({
                                 uri,
                                 reply,
    onClick
                             }: {
    uri: string
    reply?: AppBskyFeedPost.ReplyRef
    onClick: () => void
}) => {
    const {user} = useSession()
    const {did: authorDid, collection, rkey} = splitUri(uri)
    const isAuthor = user && user.did == authorDid

    if (!isAuthor) return

    const isOptimistic = rkey.startsWith("optimistic")

    return <DropdownMenuItem onClick={onClick} disabled={isOptimistic}>
        <div>
            <TrashIcon fontSize={20}/>
        </div>
        <div>Borrar {collection2displayText[collection]}</div>
    </DropdownMenuItem>
}


export default OptionsDeleteButton