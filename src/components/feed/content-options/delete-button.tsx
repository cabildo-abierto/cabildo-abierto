import {OptionsDropdownButton} from "./options-dropdown-button";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {post} from "@/utils/fetch";
import {getCollectionFromUri, getRkeyFromUri, splitUri} from "@/utils/uri";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {
    contentQueriesFilter,
    updateContentInQueries,
    updateDatasets,
    updateTopicFeedQueries,
    updateTopicHistories
} from "@/queries/updates";
import {isTopicView} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";


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

function optimisticDelete(qc: any, uri: string) {
    updateContentInQueries(qc, uri, c => null)
    updateTopicHistories(qc, uri, e => null)
    updateDatasets(qc,  uri, e => null)
    updateTopicFeedQueries(qc, uri, e => null)
}

const deleteRecord = async ({uri}: { uri: string }) => {
    const {collection, rkey} = splitUri(uri)
    return post(`/delete-record/${collection}/${rkey}`)
}

const DeleteButton = ({uri, onClose}: {uri: string, onClose: () => void}) => {
    const qc = useQueryClient()

    const deleteMutation = useMutation({
        mutationFn: deleteRecord,
        onMutate: (likedContent) => {
            optimisticDelete(qc, likedContent.uri)
            qc.cancelQueries(contentQueriesFilter(uri))
            onClose()
        },
        onSettled: async () => {
            qc.invalidateQueries(contentQueriesFilter(uri))
        },
    })

    async function onClickDelete() {
        deleteMutation.mutate({uri})
        return {}
    }

    const collection = getCollectionFromUri(uri)
    return <OptionsDropdownButton
        text1={"Borrar " + collection2displayText[collection]}
        startIcon={<DeleteOutlineIcon/>}
        handleClick={onClickDelete}
        disabled={getRkeyFromUri(uri) == "optimistic"}
    />
}


export default DeleteButton