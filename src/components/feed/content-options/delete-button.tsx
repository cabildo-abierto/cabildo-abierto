import {OptionsDropdownButton} from "./options-dropdown-button";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {post} from "@/utils/fetch";
import {
    getCollectionFromUri,
    getRkeyFromUri,
    isArticle,
    isDataset,
    isPost,
    isTopicVersion,
    splitUri
} from "@/utils/uri";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {
    contentQueriesFilter,
    updateContentInQueries,
    updateDatasets,
    updateTopicFeedQueries,
    updateTopicHistories
} from "@/queries/updates";
import {useState} from "react";
import {BaseFullscreenPopup} from "../../../../modules/ui-utils/src/base-fullscreen-popup";
import { Button } from "../../../../modules/ui-utils/src/button";
import StateButton from "../../../../modules/ui-utils/src/state-button";


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


function getDeleteContentMessage(collection: string){
    if(isPost(collection)){
        return "Si eliminás la publicación, no vas a poder recuperarla."
    } else if(isArticle(collection)){
        return "Si eliminás el artículo, no vas a poder recuperarlo."
    } else if(isTopicVersion(collection)){
        return "Si eliminás la edición, no vas a poder recuperarla."
    } else if(isDataset(collection)){
        return "Si eliminás el conjunto de datos, no vas a poder recuperarlo."
    } else {
        return "Si eliminás el contenido, no vas a poder recuperarlo."
    }
}

function getCollectionWithArticle(collection: string){
    if(isPost(collection)){
        return "la publicación"
    } else if(isArticle(collection)){
        return "el artículo"
    } else if(isTopicVersion(collection)){
        return "la edición"
    } else if(isDataset(collection)){
        return "el conjunto de datos"
    } else {
        return "el contenido"
    }
}


const DeleteButton = ({uri, onClose}: {uri: string, onClose: () => void}) => {
    const qc = useQueryClient()
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)

    const deleteMutation = useMutation({
        mutationFn: deleteRecord,
        onMutate: (likedContent) => {
            optimisticDelete(qc, likedContent.uri)
            qc.cancelQueries(contentQueriesFilter(uri))
            onClose()
        },
        onSettled: async (res) => {
            if(res.error){
                console.error(res.error)
            }
            qc.resetQueries(contentQueriesFilter(uri))
        }
    })

    async function onClickDelete() {
        setDeleteModalOpen(true)
        return {}
    }

    const isOptimistic = getRkeyFromUri(uri).startsWith("optimistic")

    const collection = getCollectionFromUri(uri)
    return <>
        <OptionsDropdownButton
            text1={"Borrar " + collection2displayText[collection]}
            startIcon={<DeleteOutlineIcon/>}
            handleClick={onClickDelete}
            disabled={isOptimistic}
        />
        <BaseFullscreenPopup open={deleteModalOpen} closeButton={true} onClose={() => {setDeleteModalOpen(false)}}>
            <div className={"px-8 pb-4 space-y-4"}>
                <h3>
                    ¿Querés borrar {getCollectionWithArticle(collection)}?
                </h3>
                <div className={"font-light text-[var(--text-light)] max-w-[300px]"}>
                    {getDeleteContentMessage(collection)}
                </div>
                <div className={"flex justify-end space-x-2 mr-2"}>
                    <Button
                        size={"small"}
                        onClick={() => {setDeleteModalOpen(false)}}
                    >
                        <span className={"font-semibold"}>
                            Cancelar
                        </span>
                    </Button>
                    <StateButton
                        handleClick={async (e) => {
                            deleteMutation.mutate({uri})
                            return {}
                        }}
                        size={"small"}
                        color={"red-dark"}
                        text1={"Borrar"}
                        textClassName={"font-semibold text-[var(--button-text)]"}
                    />
                </div>
            </div>
        </BaseFullscreenPopup>
    </>
}


export default DeleteButton