import React, {ReactNode, useState} from "react";
import {IconButton} from "@mui/material";
import {BasicButton} from "../ui-utils/basic-button";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import {useSearchParams} from "next/navigation";
import {TopicProps} from "../../app/lib/definitions";
import Link from "next/link";
import { DateSince } from "../ui-utils/date";
import {articleButtonClassname} from "./topic-content";
import SelectionComponent from "../search/search-selection-component";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {ModalBelow} from "../ui-utils/modal-below";
import {topicUrl} from "../utils/uri";
import {getCurrentVersion} from "./utils";

export type WikiEditorState = "changes" | "authors" | "normal" |
    "editing" | "editing-synonyms" | "editing-categories" | "history" | "minimized"


const MoreOptionsButton = ({
    setWikiEditorState,
}: {
    setWikiEditorState: (state: WikiEditorState) => void
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null)

    return <div style={{ position: 'relative', display: 'inline-block' }}>
        <div className={"text-[var(--text-light)]"}>
            <IconButton
                color="inherit"
                size={"small"}
                onClick={(e) => {e.preventDefault(); e.stopPropagation(); setAnchorEl(e.target); setIsDropdownOpen(prev => !prev)}}
            >
                <MoreHorizIcon fontSize="small" />
            </IconButton>
        </div>

        <ModalBelow
            anchorEl={anchorEl}
            open={isDropdownOpen}
            onClose={() => {setIsDropdownOpen(false)}}
        >
            <div className="text-base border rounded bg-[var(--content)] p-1 flex flex-col space-y-1">
                <BasicButton
                    onClick={() => {setWikiEditorState("editing-synonyms"); setIsDropdownOpen(false)}}
                    color={"inherit"}
                >
                    Editar sinónimos
                </BasicButton>
                <BasicButton
                    onClick={() => {setWikiEditorState("editing-categories"); setIsDropdownOpen(false)}}
                    color={"inherit"}
                >
                    Editar categorías
                </BasicButton>
            </div>
        </ModalBelow>
    </div>
}


export const TopicContentExpandedViewHeader = ({
                                                   wikiEditorState,
                                                   setWikiEditorState,
                                                   setPinnedReplies,
                                                   setShowingSaveEditPopup,
    topic,
    saveEnabled
}: {
    topic: TopicProps
    wikiEditorState: WikiEditorState
    setWikiEditorState: (s: WikiEditorState) => void
    setPinnedReplies: (v: string[]) => void
    setShowingSaveEditPopup: (v: boolean) => void
    saveEnabled: boolean
}) => {
    const searchParams = useSearchParams()

    const paramsVersion = searchParams.get("v")
    const paramsVersionInt = Number(paramsVersion)
    const currentVersion = getCurrentVersion(topic)
    const isCurrent = paramsVersion == null || currentVersion == paramsVersionInt

    let buttons: ReactNode

    if(isCurrent && wikiEditorState != "editing") {
        function optionsNodes(o: string, isSelected: boolean){
            let name: string
            if(o == "authors") name = "Ver autores"
            else if(o == "changes") name = "Ver cambios"
            else if(o == "history") name = "Ver historial"
            else if(o == "editing") name = "Editar"
            return <button
                className={"w-32 " + articleButtonClassname + (isSelected ? " toggled" : "")}
            >
                <div className={"pt-1"}>
                    {name}
                </div>
            </button>
        }

        function onSelection(v: string){
            if(wikiEditorState != v){
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

        buttons = <div className={"flex"}>
            <SelectionComponent
                onSelection={onSelection}
                options={options}
                optionsNodes={optionsNodes}
                selected={wikiEditorState}
                className={"flex"}
            />
        </div>
    } else if(isCurrent && wikiEditorState == "editing") {
        buttons = <div>
            {wikiEditorState == "editing" &&
                <>
                    <button
                        className={articleButtonClassname}
                        onClick={() => {
                            setWikiEditorState("normal")
                        }}
                    >
                        <div className={"px-2 pt-1"}>Cancelar edición</div>
                    </button>
                </>
            }
            {wikiEditorState == "editing" &&
                <button
                    className={articleButtonClassname}
                    onClick={() => {
                        setShowingSaveEditPopup(true)
                    }}
                    disabled={!saveEnabled}
                >
                    <div className={"px-2 pt-1"}>Guardar cambios</div>
                </button>
            }
        </div>
    } else {
        buttons = <div className={"flex items-center space-x-2"}>
            <div>
                Versión {paramsVersion} (publicada <DateSince date={topic.versions[paramsVersion].createdAt}/>).
            </div>
            <div className={"link"}>
                <Link
                    href={topicUrl(topic.id, currentVersion, "normal")}
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