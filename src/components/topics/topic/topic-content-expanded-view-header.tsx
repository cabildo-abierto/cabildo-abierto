import React, {ReactNode, useState} from "react";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import {useSearchParams} from "next/navigation";
import {TopicProps} from "@/lib/definitions";
import Link from "next/link";
import { DateSince } from "../../../../modules/ui-utils/src/date";
import SelectionComponent from "@/components/buscar/search-selection-component";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {splitUri, topicUrl} from "@/utils/uri";
import {SmallTopicVersionProps} from "./topic-content-expanded-view";
import {IconButton} from "@/../modules/ui-utils/src/icon-button"
import {Button} from "@/../modules/ui-utils/src/button"
import {OptionsDropdownButton} from "@/components/feed/content-options/options-dropdown-button";
import {ModalOnClick} from "../../../../modules/ui-utils/src/modal-on-click";


export type WikiEditorState = "changes" | "authors" | "normal" |
    "editing" | "editing-synonyms" | "editing-categories" | "history" | "minimized"


const MoreOptionsButton = ({
    setWikiEditorState,
}: {
    setWikiEditorState: (state: WikiEditorState) => void
}) => {

    const modal = (onClose: () => void) => (
        <div className="text-base bg-[var(--background-dark)] border rounded p-1 flex flex-col space-y-1">
            <OptionsDropdownButton
                onClick={() => {
                    setWikiEditorState("editing-synonyms");
                    onClose()
                }}
                text1={"Editar sinónimos"}
            />
            <OptionsDropdownButton
                onClick={() => {
                    setWikiEditorState("editing-categories");
                    onClose()
                }}
                text1={"Editar categorías"}
            />
        </div>
    )

    return <ModalOnClick modal={modal}>
        <div className={"text-[var(--text-light)]"}>
            <IconButton
                color="inherit"
                size={"small"}
            >
                <MoreHorizIcon fontSize="small"/>
            </IconButton>
        </div>
    </ModalOnClick>
}


export const TopicContentExpandedViewHeader = ({
                                                   wikiEditorState,
                                                   setWikiEditorState,
                                                   setPinnedReplies,
                                                   setShowingSaveEditPopup,
                                                   topic,
                                                   topicVersion,
                                                   saveEnabled
                                               }: {
    topic: TopicProps
    topicVersion: SmallTopicVersionProps
    wikiEditorState: WikiEditorState
    setWikiEditorState: (s: WikiEditorState) => void
    setPinnedReplies: (v: string[]) => void
    setShowingSaveEditPopup: (v: boolean) => void
    saveEnabled: boolean
}) => {
    const searchParams = useSearchParams()

    const paramsVersion = searchParams.get("v") ? Number(searchParams.get("v")) : undefined

    let buttons: ReactNode



    if(!paramsVersion && wikiEditorState != "editing") {
        function optionsNodes(o: string, isSelected: boolean){
            let name: string
            if(o == "authors") name = "Ver autores"
            else if(o == "changes") name = "Ver cambios"
            else if(o == "history") name = "Ver historial"
            else if(o == "editing") name = "Editar"
            return <div className="text-[var(--text)] h-10 ">
                <Button
                    variant="text"
                    color="inherit"
                    fullWidth={true}
                    disableElevation={true}
                    sx={{
                        textTransform: "none",
                        paddingY: 0,
                        borderRadius: 0
                    }}
                >
                    <div
                        className={"whitespace-nowrap mx-2 font-semibold pb-1 pt-2 border-b-[4px] " + (isSelected ? "border-[var(--text-light)] border-b-[4px] text-[var(--text)]" : "text-[var(--text-light)] border-transparent")}>
                        {name}
                    </div>
                </Button>
            </div>
        }

        function onSelection(v: string) {
            if (wikiEditorState != v) {
                setWikiEditorState(v as WikiEditorState)
            } else {
                setWikiEditorState("normal")
            }
        }

        const options = [
            "editing",
            "history",
            "authors",
            "changes"
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
    } else if(!paramsVersion && wikiEditorState == "editing") {
        buttons = <div className={"w-full flex justify-end"}>
            {wikiEditorState == "editing" &&
                <Button
                    onClick={() => {
                        setWikiEditorState("normal")
                    }}
                    variant={"text"}
                    sx={{borderRadius: 0}}
                >
                    <div className={"px-2 pt-1 font-semibold text-[var(--text-light)]"}>Cancelar edición</div>
                </Button>
            }
            {wikiEditorState == "editing" &&
                <Button
                    onClick={() => {
                        setShowingSaveEditPopup(true)
                    }}
                    variant={"text"}
                    sx={{borderRadius: 0}}
                    disabled={!saveEnabled}
                >
                    <div className={"px-2 pt-1 font-semibold text-[var(--text-light)]"}>
                        Guardar cambios
                    </div>
                </Button>
            }
        </div>
    } else {
        buttons = <div className={"flex items-center space-x-2"}>
            <div>
                Versión {paramsVersion} (publicada <DateSince date={topicVersion.content.record.createdAt}/>).
            </div>
            <div className={"link"}>
                <Link
                    href={topicUrl(topic.id, splitUri(topicVersion.uri), "normal")}
                    className={""}
                >
                    Ir a la versión actual
                </Link>
            </div>
        </div>
    }

    return <div className={"flex justify-between items-end border-b"}>
        {buttons}
        <div className={"flex space-x-1 mb-1"}>
            {wikiEditorState != "editing" && <MoreOptionsButton
                setWikiEditorState={setWikiEditorState}
            />}
            {wikiEditorState != "editing" && <IconButton
                size="small"
                onClick={() => {
                    setPinnedReplies([])
                    setWikiEditorState("minimized")
                }}
            >
                <FullscreenExitIcon fontSize={"small"}/>
            </IconButton>}
        </div>
    </div>
}