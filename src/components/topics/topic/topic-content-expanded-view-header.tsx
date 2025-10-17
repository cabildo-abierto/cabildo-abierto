import React, {Dispatch, ReactNode, SetStateAction} from "react";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import {useSearchParams} from "next/navigation";
import Link from "next/link";
import {DateSince} from "../../layout/utils/date";
import SelectionComponent from "@/components/buscar/search-selection-component";
import {splitUri, topicUrl} from "@/utils/uri";
import {IconButton} from "@/components/layout/utils/icon-button"
import {Button} from "@/components/layout/utils/button"
import {useSession} from "@/queries/getters/useSession";
import {WikiEditorState} from "@/lib/types";
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"
import {useLoginModal} from "@/components/layout/login-modal-provider";


export const TopicContentExpandedViewHeader = ({
                                                   wikiEditorState,
                                                   setWikiEditorState,
                                                   setPinnedReplies,
                                                   setShowingSaveEditPopup,
                                                   topic,
                                                   saveEnabled
                                               }: {
    topic: ArCabildoabiertoWikiTopicVersion.TopicView
    wikiEditorState: WikiEditorState
    setWikiEditorState: (s: WikiEditorState) => void
    setPinnedReplies: Dispatch<SetStateAction<string[]>>
    setShowingSaveEditPopup: (v: boolean) => void
    saveEnabled: boolean
}) => {
    const searchParams = useSearchParams()
    const {user} = useSession()
    const {setLoginModalOpen} = useLoginModal()

    const paramsVersion = searchParams.get("v") ? Number(searchParams.get("v")) : undefined

    let buttons: ReactNode

    if (!paramsVersion && !wikiEditorState.startsWith("editing")) {
        function optionsNodes(o: WikiEditorState, isSelected: boolean) {
            let name: string
            if (o == "history") name = "Historial"
            else if (o == "editing") name = "Editar"
            else if (o == "props") name = "Propiedades"
            return <div
                className="text-[var(--text)]"
                title={user != undefined ? undefined : "Iniciá sesión."}
                id={`topic-header-button-${o}`}
            >
                <Button
                    variant="text"
                    color="background"
                    fullWidth={true}
                    disableElevation={true}
                    sx={{
                        textTransform: "none",
                        paddingY: 0,
                        borderRadius: 0
                    }}
                >
                    <div
                        className={"uppercase text-xs whitespace-nowrap mx-2 font-semibold pb-1 pt-2 border-b-[4px] " + (isSelected ? "border-[var(--text-light)] border-b-[4px] text-[var(--text)]" : "text-[var(--text-light)] border-transparent")}
                    >
                        {name}
                    </div>
                </Button>
            </div>
        }

        function onSelection(v: string) {
            if((v == "editing" || v == "edit-props") && !user){
                setLoginModalOpen(true)
            } else {
                if (wikiEditorState != v) {
                    setWikiEditorState(v as WikiEditorState)
                } else {
                    setWikiEditorState("normal")
                }
            }
        }

        const options = [
            "editing",
            "history",
            "props"
        ]

        buttons = <div className={"flex max-w-screen overflow-scroll no-scrollbar"}>
            <SelectionComponent
                onSelection={onSelection}
                options={options}
                optionsNodes={optionsNodes}
                selected={wikiEditorState}
                className={"flex"}
            />
        </div>
    } else if (!paramsVersion && wikiEditorState.startsWith("editing")) {
        buttons = <div className={"w-full flex justify-between items-end"}>
            <div className="text-[var(--text)]">
                <Button
                    variant="text"
                    color="background"
                    fullWidth={true}
                    disableElevation={true}
                    sx={{
                        textTransform: "none",
                        paddingY: 0,
                        borderRadius: 0
                    }}
                    onClick={() => {
                        if (wikiEditorState == "editing") setWikiEditorState("editing-props"); else setWikiEditorState("editing")
                    }}
                >
                    <div
                        className={"whitespace-nowrap uppercase text-xs mx-2 font-semibold pb-1 pt-2 border-b-[4px] " + (wikiEditorState == "editing-props" ? "border-[var(--text-light)] border-b-[4px] text-[var(--text)]" : "text-[var(--text-light)] border-transparent")}>
                        Propiedades
                    </div>
                </Button>
            </div>
            <div className={"flex items-end"}>
                <Link
                    target={"_blank"}
                    className={"mb-1 mr-2 text-xs text-[13px] hover:bg-[var(--background-dark2)] uppercase py-1 px-2 border bg-[var(--background-dark)] font-semibold"}
                    href={topicUrl("Cabildo Abierto: Wiki", undefined, "normal")}
                >
                    Guía de edición
                </Link>
                <Button
                    onClick={() => {
                        setWikiEditorState("normal")
                    }}
                    variant={"text"}
                    sx={{borderRadius: 0}}
                    color={"background"}
                >
                    <div className={"uppercase text-xs px-2 pt-1 font-semibold text-[var(--text-light)]"}>
                        Cancelar
                    </div>
                </Button>
                <Button
                    onClick={() => {
                        if(!user) {
                            setLoginModalOpen(true)
                        } else {
                            setShowingSaveEditPopup(true)
                        }
                    }}
                    variant={"text"}
                    sx={{borderRadius: 0}}
                    disabled={!saveEnabled}
                    color={"background"}
                >
                    <div className={"uppercase text-xs px-2 pt-1 font-semibold text-[var(--text-light)]"}>
                        Guardar
                    </div>
                </Button>
            </div>
        </div>
    } else {
        buttons = <div className={"flex items-center space-x-2"}>
            <div>
                Versión {paramsVersion} (publicada <DateSince date={topic.createdAt}/>).
            </div>
            <div className={"link"}>
                <Link
                    href={topicUrl(topic.id, splitUri(topic.uri), "normal")}
                    className={""}
                >
                    Ir a la versión actual
                </Link>
            </div>
        </div>
    }

    return <div className={"flex justify-between items-end border-b border-[var(--accent-dark)]"}>
        {buttons}
        {!wikiEditorState.startsWith("editing") && wikiEditorState != "minimized" && <div className={"flex items-center space-x-1"}>
            <div className={"pb-1 text-[var(--text-light)]"}>
                <IconButton
                    size="small"
                    onClick={() => {
                        setPinnedReplies([])
                        setWikiEditorState("minimized")
                    }}
                    color={"background"}
                    sx={{borderRadius: 0}}
                >
                    <FullscreenExitIcon fontSize={"small"} color={"inherit"}/>
                </IconButton>
            </div>
        </div>}
    </div>
}