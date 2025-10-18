import {OptionsDropdownButton} from "./options-dropdown-button";
import {post} from "@/utils/fetch";
import {
    isArticle,
    isDataset,
    isPost,
    isTopicVersion,
    splitUri
} from "@/utils/uri";
import {QueryClient, useMutation, useQueryClient} from "@tanstack/react-query";
import {
    contentQueriesFilter,
    updateContentInQueries,
    updateDatasets,
    updateTopicHistories
} from "@/queries/mutations/updates";
import {useState} from "react";
import {BaseFullscreenPopup} from "../utils/base-fullscreen-popup";
import { Button } from "../utils/button";
import StateButton from "../utils/state-button";
import { TrashIcon } from "@phosphor-icons/react";
import {useSession} from "@/queries/getters/useSession";



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


/*function isContentInThreadViewContent(uri: string, t: MaybeThreadViewContent) {
    if(!ArCabildoabiertoFeedDefs.isThreadViewContent(t)) return false

    let content = t.content

    if(postOrArticle(content) && content.uri == uri){
        return true
    }

    const inReplies = t.replies
        ?.some(r => isContentInThreadViewContent(uri, r))

    if(inReplies) return true

    return isContentInThreadViewContent(uri, t.parent)
}


function isContentInFeed(uri: string, feed: InfiniteFeed<ArCabildoabiertoFeedDefs.FeedViewContent>){
    return feed.pages
        .some(page => page.data.some(r => postOrArticle(r.content) && r.content.uri == uri))
}


function isContentInPostFeed(uri: string, feed: InfiniteFeed<ArCabildoabiertoFeedDefs.PostView>){
    return feed.pages
        .some(page => page.data.some(r => r.uri == uri))
}


function queriesWithContent(qc: QueryClient, uri: string) {
    const queries: string[][] = []
    qc.getQueryCache()
        .getAll()
        .filter(q => Array.isArray(q.queryKey))
        .forEach(q => {
            qc.setQueryData(q.queryKey, old => {
                if (!old) return old

                const k = q.queryKey

                if (k[0] == "thread") {
                    const t = old as MaybeThreadViewContent
                    return isContentInThreadViewContent(uri, t)
                } else if (k[0] == "main-feed" || k[0] == "profile-feed" || k[0] == "topic-feed") {
                    return isContentInFeed(uri, old as InfiniteFeed<ArCabildoabiertoFeedDefs.FeedViewContent>)
                } else if(k[0] == "topic-quote-replies"){
                    return (old as ArCabildoabiertoFeedDefs.PostView[]).some(p => p.uri == uri)
                } else if(k[0] == "details-content" && k[1] == "quotes"){
                    if(uri == k[2]) return true
                    return isContentInPostFeed(uri, old as InfiniteFeed<ArCabildoabiertoFeedDefs.PostView>)
                }
            })
        })
    return queries
}*/


function optimisticDelete(qc: QueryClient, uri: string) {
    updateContentInQueries(qc, uri, c => null)
    updateTopicHistories(qc, uri, e => null)
    updateDatasets(qc,  uri, e => null)
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


function invalidateQueriesAfterDeleteSuccess(uri: string, qc: QueryClient) {
    //const queries = queriesWithContent(qc, uri)
    //invalidateQueries(qc, queries)
}


const OptionsDeleteButton = ({uri, onClose}: {uri: string, onClose: () => void}) => {
    const qc = useQueryClient()
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const {user} = useSession()
    const {did: authorDid, collection, rkey} = splitUri(uri)
    const isAuthor = user && user.did == authorDid

    const deleteMutation = useMutation({
        mutationFn: deleteRecord,
        onMutate: (likedContent) => {
            try {
                optimisticDelete(qc, likedContent.uri)
                qc.cancelQueries(contentQueriesFilter(uri))
                onClose()
            } catch (err) {
                console.log("Error on mutate", uri)
                console.log(err)
            }
        },
        onSuccess: async (res) => {
            if(res.error){
                console.error(res.error)
            }
            invalidateQueriesAfterDeleteSuccess(uri, qc)
        }
    })

    async function onClickDelete() {
        setDeleteModalOpen(true)
        return {}
    }

    if(!isAuthor) return

    const isOptimistic = rkey.startsWith("optimistic")

    return <>
        <OptionsDropdownButton
            text1={"Borrar " + collection2displayText[collection]}
            startIcon={<TrashIcon/>}
            handleClick={onClickDelete}
            disabled={isOptimistic}
        />
        <BaseFullscreenPopup open={deleteModalOpen} closeButton={true} onClose={() => {setDeleteModalOpen(false)}}>
            <div className={"px-8 pb-4 space-y-4"}>
                <h3 className={"normal-case"}>
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
                        <span className={""}>
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
                        textClassName={"text-[var(--white-text)]"}
                    />
                </div>
            </div>
        </BaseFullscreenPopup>
    </>
}


export default OptionsDeleteButton