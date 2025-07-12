import {BaseFullscreenPopup} from "../../../../modules/ui-utils/src/base-fullscreen-popup";
import {useTopicVersionChanges} from "@/queries/api";
import {splitUri} from "@/utils/uri";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {getEditorSettings} from "@/components/editor/settings";
import dynamic from "next/dynamic";
import {MatchesType} from "@/lib/types";
import {SerializedDiffNode} from "../../../../modules/ca-lexical-editor/src/nodes/DiffNode";
import {SerializedEditorState} from "lexical";
import {produce} from "immer";
import {decompress} from "@/utils/compression";
import {
    editorStateToMarkdown,
    markdownToEditorState
} from "../../../../modules/ca-lexical-editor/src/markdown-transforms";
import React, {useMemo, useState} from "react";
import {TopicHistory} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {FormControl, InputLabel, MenuItem, Select as MUISelect} from "@mui/material";
import {DateSince} from "../../../../modules/ui-utils/src/date";


const MyLexicalEditor = dynamic(() => import( '../../../../modules/ca-lexical-editor/src/lexical-editor' ), {ssr: false});


function getChanges(prevText: SerializedEditorState, newText: SerializedEditorState, diff: MatchesType): SerializedEditorState {
    const {common} = diff
    const markdown1 = editorStateToMarkdown(prevText)
    const markdown2 = editorStateToMarkdown(newText)

    const nodes1 = markdown1.markdown.split("\n\n")
    const nodes2 = markdown2.markdown.split("\n\n")

    function newDiffNode(kind: string, md: string) {
        const nodeEditorState = markdownToEditorState(md)
        if (md.length == 0) {
            return null
        }
        const diffNode: SerializedDiffNode = {
            children: [nodeEditorState.root.children[0]],
            type: "diff",
            kind: kind,
            direction: 'ltr',
            version: 1,
            format: 'left',
            indent: 0
        }
        return diffNode
    }

    let i = 0
    let j = 0
    let newChildren = []
    for (let k = 0; k < common.length; k++) {
        const {x, y} = common[k]
        while (i < x && i < nodes1.length) {
            newChildren.push(newDiffNode("removed", nodes1[i]))
            i++
        }
        while (j < y && j < nodes2.length) {
            newChildren.push(newDiffNode("new", nodes2[j]))
            j++
        }
        if(x < nodes1.length){
            newChildren.push(newDiffNode("no dif", nodes1[x]))
        }
        i++
        j++
    }
    while (i < nodes1.length) {
        newChildren.push(newDiffNode("removed", nodes1[i]))
        i++
    }
    while (j < nodes2.length) {
        newChildren.push(newDiffNode("new", nodes2[j]))
        j++
    }

    return produce(newText, draft => {
        draft.root.children = newChildren.filter(x => x != null)
    })
}


export function anyEditorStateToMarkdownOrLexical(text: string | null, format: string | null): {
    text: string,
    format: string
} {
    if (!text || text.length == 0) {
        return {text: "", format: "markdown"}
    } else if (format == "markdown") {
        return {text, format: "markdown"}
    } else if (format == "lexical") {
        return {text, format: "lexical"}
    } else if (format == "lexical-compressed") {
        return anyEditorStateToMarkdownOrLexical(decompress(text), "lexical")
    } else if (format == "markdown-compressed") {
        return anyEditorStateToMarkdownOrLexical(decompress(text), "markdown")
    } else if (format == "html") {
        throw Error("Sin implementar.")
    } else if (format == "html-compressed") {
        return anyEditorStateToMarkdownOrLexical(decompress(text), "html")
    } else if (!format) {
        return anyEditorStateToMarkdownOrLexical(text, "lexical-compressed")
    } else {
        throw Error("Formato de contenido desconocido: " + format)
    }
}


export function anyEditorStateToLexical(text: string | null, format: string | null): SerializedEditorState {
    const mdOrLexical = anyEditorStateToMarkdownOrLexical(text, format)
    if (mdOrLexical.format == "markdown") {
        return markdownToEditorState(mdOrLexical.text)
    } else {
        return JSON.parse(mdOrLexical.text)
    }
}


const TopicChanges = ({history, prevVersionIdx, newVersionIdx}: {
    history: TopicHistory, prevVersionIdx: number, newVersionIdx: number
}) => {
    const {did, rkey} = splitUri(history.versions[newVersionIdx].uri)
    const {did: prevDid, rkey: prevRkey} = splitUri(history.versions[prevVersionIdx].uri)
    const {data, isLoading} = useTopicVersionChanges(did, rkey, prevDid, prevRkey)

    const contentWithChanges = useMemo(() => {
        if(data){
            let lexicalPrev: SerializedEditorState
            let lexicalCur: SerializedEditorState
            try {
                lexicalPrev = anyEditorStateToLexical(data.prevText, data.prevFormat);
                lexicalCur = anyEditorStateToLexical(data.curText, data.curFormat);
            } catch (err) {
                return null
            }

            return getChanges(lexicalPrev, lexicalCur, data.diff)
        }
    }, [data])

    if(isLoading) {
        return <div className={"py-8"}>
            <LoadingSpinner/>
        </div>
    } else if(!contentWithChanges) {
        return <div className={"text-center text-[var(--text-light)] py-8"}>
            Ocurrió un error al procesar los contenidos.
        </div>
    }

    let settings = getEditorSettings({
        initialText: JSON.stringify(contentWithChanges),
        initialTextFormat: "lexical",
        tableOfContents: true,
        editorClassName: "relative article-content not-article-content min-h-[300px]",
    })

    return <div className={"pr-2 pl-20"}>
        <div className={"rounded pt-2"} id={`${prevRkey}:${rkey}`}>
            <MyLexicalEditor
                settings={settings}
                setEditor={() => {
                }}
                setEditorState={() => {
                }}
            />
        </div>
    </div>
}


const VersionSelector = ({selected, setSelected, history, label}: {
    label: string, selected: number, setSelected: (v: number) => void, history: TopicHistory
}) => {

    const selectId = label
    return <FormControl fullWidth variant="outlined" size="small">
        <InputLabel
            id={selectId}
            sx={{
                fontSize: 14,
                "&.MuiInputLabel-shrink": {fontSize: 13}
            }}
        >
            {label}
        </InputLabel>
        <MUISelect
            value={selected}
            onChange={(e) => setSelected(Number(e.target.value))}
            label={label}
            labelId={selectId}
            fullWidth
            sx={{
                fontSize: 13,
                backgroundColor: "var(--background-dark)"
            }}
            MenuProps={{
                PaperProps: {
                    sx: {
                        backgroundColor: "var(--background-dark)",
                        paddingTop: 0,
                        marginTop: "2px",
                        paddingBottom: 0,
                        boxShadow: "none", // Removes the shadow
                        borderWidth: "1px"
                    },
                    elevation: 0 // Also ensures no elevation shadow
                }
            }}
        >
            {history.versions.map((v, i) => (
                <MenuItem
                    key={i}
                    value={i}
                    sx={{
                        backgroundColor: "var(--background-dark)",
                        '&.Mui-selected': {
                            backgroundColor: "var(--background-dark)",
                        },
                        '&.Mui-selected:hover': {
                            backgroundColor: "var(--background-dark2)",
                        },
                        '&:hover': {
                            backgroundColor: "var(--background-dark2)",
                        }
                    }}
                >
                    <div className={"text-[14px] flex items-center space-x-2"}>
                        <div className={""}>
                            Versión {i+1}
                        </div>
                        <div className={"text-[var(--text-light)]"}>
                            @{v.author.handle} hace <DateSince date={v.createdAt}/>
                        </div>
                    </div>
                </MenuItem>
            ))}
        </MUISelect>
    </FormControl>
}


export const TopicChangesModal = ({open, onClose, uri, prevUri, history}: {
    open: boolean
    onClose: () => void
    uri: string
    prevUri: string
    history: TopicHistory
}) => {
    const [prevVersionIdx, setPrevVersionIdx] = useState<number>(history.versions.findIndex(v => v.uri == prevUri))
    const [newVersionIdx, setNewVersionIdx] = useState<number>(history.versions.findIndex(v => v.uri == uri))

    return <BaseFullscreenPopup
        open={open}
        onClose={onClose}
        closeButton={true}
    >
        <div className={"flex flex-col items-center space-y-2"}>
            <h3>Cambios entre versiones</h3>
        </div>
        <div className={"flex justify-between space-x-8 px-4 pt-6"}>
            <VersionSelector
                selected={prevVersionIdx}
                setSelected={setPrevVersionIdx}
                history={history}
                label={"Versión anterior"}
            />
            <VersionSelector
                selected={newVersionIdx}
                setSelected={setNewVersionIdx}
                history={history}
                label={"Versión nueva"}
            />
        </div>
        <div className="text-sm text-center block lg:hidden content-container p-1 w-full">
            <p>Para ver qué cambió en esta versión del tema entrá a la página desde una pantalla más grande (por ejemplo
                una computadora).</p>
        </div>
        {newVersionIdx != prevVersionIdx && <div className="p-4 max-w-[800px] max-h-[500px] overflow-y-scroll my-2">
            <TopicChanges
                history={history}
                prevVersionIdx={prevVersionIdx}
                newVersionIdx={newVersionIdx}
            />
        </div>}
        {newVersionIdx == prevVersionIdx && <div className={"text-center py-8 text-[var(--text-light)]"}>
            Elegí dos versiones distintas.
        </div>}
    </BaseFullscreenPopup>
}