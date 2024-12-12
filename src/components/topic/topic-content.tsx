import Button from "@mui/material/Button";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import {DateSince} from "../date";
import {CustomLink as Link} from "../custom-link";
import {articleUrl, currentVersion, hasEditPermission, inRange} from "../utils";
import {ArticleOtherOptions} from "./article-other-options";
import {SetProtectionButton} from "../protection-button";
import {EntityCategories} from "../categories";
import {getTopicTitle} from "./utils";
import {EditHistory} from "../edit-history";
import { TopicProps } from "../../app/lib/definitions";
import { useUser } from "../../hooks/user";
import {ToggleButton} from "../toggle-button";
import {articleButtonClassname} from "../editor/wiki-editor";
import {NeedAccountPopup} from "../need-account-popup";
import {useState} from "react";
import StateButton from "../state-button";
import {smoothScrollTo} from "../editor/plugins/TableOfContentsPlugin";


export const TopicContent = ({
                                 topic, version, selectedPanel, setSelectedPanel}: {
    topic: TopicProps, version: number, selectedPanel: string, setSelectedPanel: (v: string) => void}) => {
    const user = useUser()
    const [showingNeedAccountPopup, setShowingNeedAccountPopup] = useState(false)

    const lastUpdated = topic.versions[topic.versions.length-1].content.createdAt

    const currentIndex = currentVersion(topic)
    const isCurrent = version == currentIndex

    async function onEdit(v){
        if(!v || user.user != null){
            setSelectedPanel("editing")
        } else if(user.user == null){
            setShowingNeedAccountPopup(true)
        }
    }

    const EditButton = () => {
        if(hasEditPermission(user.user, topic.protection)){
            return <ToggleButton
                text="Editar"
                toggledText="Cancelar edición"
                className={articleButtonClassname}
                setToggled={onEdit}
                disabled={!isCurrent}
                toggled={selectedPanel == "editing"}
            />
        } else {
            return <ToggleButton
                text="Proponer edición"
                toggledText="Cancelar edición"
                className={articleButtonClassname}
                setToggled={onEdit}
                disabled={!isCurrent}
                toggled={selectedPanel == "editing"}
            />
        }
    }


    function setEditing(v: boolean){
        if(v) setSelectedPanel("editing"); else setSelectedPanel("none")
    }

    const ViewHistoryButton = () => {
        return <ToggleButton
            text="Historial"
            className={articleButtonClassname}
            setToggled={(v) => {if(v) setSelectedPanel("history"); else setSelectedPanel("none")}}
            toggled={selectedPanel == "history"}
        />
    }

    const ViewLastChangesButton = () => {
        return <ToggleButton
            text="Cambios"
            className={articleButtonClassname}
            setToggled={(v) => {if(v) setSelectedPanel("changes"); else setSelectedPanel("none")}}
            toggled={selectedPanel == "changes"}
        />
    }

    const ViewAuthorsButton = () => {
        return <ToggleButton
            text="Autores"
            className={articleButtonClassname}
            setToggled={(v) => {if(v) setSelectedPanel("authors"); else setSelectedPanel("none")}}
            toggled={selectedPanel == "authors"}
        />
    }

    const DeleteArticleButton = () => {
        return <StateButton
            text1="Eliminar tema"
            text2="Eliminando..."
            variant="text"
            handleClick={async () => {
                /*const {error} = await deleteEntity(entityId, user.user.id)
                mutate("/api/entities")
                router.push("/inicio")
                return {error}*/
                return {}
            }}
        />
    }

    const RecomputeContributionsButton = () => {
        return <StateButton
            variant="text"
            text1="Recalcular contribuciones"
            text2="Recalculando..."
            handleClick={async () => {
                //return await recomputeEntityContributions(entityId)
                return {}
            }}
        />
    }

    const RemoveHistoryButton = () => {
        return <StateButton
            variant="text"
            text1="Eliminar historial"
            text2="Eliminando..."
            handleClick={async () => {
                /*const {error} = await deleteEntityHistory(entityId, false);
                mutate("/api/entity/"+entityId)
                return {error}*/
                return {}
            }}
        />
    }


    const RebootArticleButton = () => {
        return <StateButton
            variant="text"
            text1="Reiniciar"
            text2="Reiniciando..."
            handleClick={async () => {
                /*const {error} = await deleteEntityHistory(entityId, true);
                mutate("/api/entity/"+entityId)
                return {error}*/
                return {}
            }}
        />
    }

    const MakePublicButton = () => {
        return <StateButton
            variant="text"
            text1="Hacer público"
            text2="Haciendo público..."
            handleClick={async () => {
                /*const {error} = await makeEntityPublic(entityId, true);
                mutate("/api/entity/"+entityId)
                return {error}*/
                return {}
            }}
        />
    }

    const UpdateWeakReferencesButton = () => {
        return <StateButton
            variant="text"
            text1="Actualizar weak references"
            text2="Actualizando..."
            handleClick={async () => {
                //return await updateAllWeakReferences()
                return {}
            }}
        />
    }

    const MakePrivateButton = () => {
        return <StateButton
            variant="text"
            text1="Hacer privado"
            text2="Haciendo privado..."
            handleClick={async () => {
                /*const {error} = await makeEntityPublic(entityId, false);
                mutate("/api/entity/"+entityId)
                return {error}*/
                return {}
            }}
        />
    }

    function onGoToDiscussion() {
        const targetElement = document.getElementById('discussion-start');

        return smoothScrollTo(targetElement, 300)
    }

    const info = <>
        <div className="flex justify-between items-center">
            {selectedPanel != "editing" && <div className="flex flex-col link text-xs sm:text-sm">

                <span className="text-[var(--text-light)] mt-2 flex items-center">
                    <div className="mr-1 flex items-center"><AccessTimeIcon fontSize="inherit"/></div> <span>Última actualización <DateSince date={lastUpdated}/>.</span>
                </span>

                {!isCurrent && <div className="flex text-[var(--text-light)]">
                    <span className="mr-1">Estás viendo la versión {version} (publicada <DateSince date={topic.versions[version].content.createdAt}/>).</span>
                    <span><Link href={articleUrl(topic.id)}>Ir a la versión actual</Link>.</span>
                </div>
                }

            </div>}
        </div>

        <div className="">
            {selectedPanel != "editing" && <div className="flex flex-wrap w-full items-center border-b mt-4">
                {isCurrent && <EditButton/>}
                <ViewHistoryButton/>
                <ViewLastChangesButton/>
                <ViewAuthorsButton/>
                <ArticleOtherOptions
                    optionList={["change-name"]}
                    topic={topic}
                />

                {(user.user && (user.user.editorStatus == "Administrator")) &&
                    <div className="flex justify-center">
                        <RecomputeContributionsButton/>
                    </div>
                }

                {(user.user && user.user.editorStatus == "Administrator") && <>
                    <div className="flex justify-center py-2">
                        <SetProtectionButton entity={topic}/>
                    </div>
                    <div className="flex justify-center py-2">
                        <DeleteArticleButton/>
                    </div>
                    <div className="flex justify-center py-2">
                        <UpdateWeakReferencesButton/>
                    </div>
                    <div className="flex justify-center py-2">
                        <RemoveHistoryButton/>
                    </div>
                    <div className="flex justify-center py-2">
                        <RebootArticleButton/>
                    </div>
                </>
                }
            </div>}
        </div>
        {selectedPanel == "categories" && <div className="px-2 content-container my-2">
            <EntityCategories
                categories={topic.versions[version].categories}
                name={getTopicTitle(topic)}
            />
        </div>}
        {selectedPanel == "history" && <div className="my-2">
            <EditHistory
                entity={topic}
                viewing={version}
            />
        </div>
        }

    </>

    return <div className="w-full p-4 border-b" id="information-start">
        <div className="flex justify-between mb-2">
            <div>
                <h2 className="">
                    Consenso
                </h2>
            </div>

            <div className="text-[var(--text-light)]">
                {selectedPanel != "editing" &&
                    <Button variant="outlined" onClick={onGoToDiscussion} size="small" color="inherit"
                            endIcon={<ArrowDownwardIcon/>}>
                        Discusión
                    </Button>}
            </div>
        </div>
        <div className="text-[var(--text-light)] text-xs sm:text-sm">
            Si no estás de acuerdo con algo editalo o comentá. También podés agregar información.
        </div>
        {info}
        <NeedAccountPopup
            text="Necesitás una cuenta para hacer ediciones."
            open={showingNeedAccountPopup}
            onClose={() => {setShowingNeedAccountPopup(false)}}
        />
    </div>
}