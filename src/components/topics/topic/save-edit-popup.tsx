import {LexicalEditor} from "lexical";
import {CustomLink as Link} from '../../layout/utils/custom-link';
import React, {useEffect, useMemo, useState} from "react";
import InfoPanel from "../../layout/utils/info-panel";
import {NotEnoughPermissionsWarning} from "./permissions-warning";
import StateButton from "../../layout/utils/state-button";
import TickButton from "../../layout/utils/tick-button";
import {ChangesCounterWithText} from "./changes-counter";
import {AcceptButtonPanel} from "../../layout/utils/accept-button-panel";
import {topicUrl} from "@/utils/uri";
import {getTopicProtection, hasEditPermission} from "./utils";
import {useSession} from "@/queries/getters/useSession";
import {Button} from "@/components/layout/utils/button"
import {BaseFullscreenPopup} from "../../layout/utils/base-fullscreen-popup";
import {post} from "@/utils/fetch";
import LoadingSpinner from "../../layout/utils/loading-spinner";
import {decompress} from "@/utils/compression";
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"
import {editorStateToMarkdown} from "../../../../modules/ca-lexical-editor/src/markdown-transforms";
import {ArCabildoabiertoFeedArticle} from "@/lex-api/index"
import { TextField } from "../../layout/utils/text-field";


const EditMessageInput = ({value, setValue}: { value: string, setValue: (v: string) => void }) => {
    return <TextField
        value={value}
        size="small"
        fullWidth
        onChange={(e) => setValue(e.target.value)}
        placeholder="Una descripción de lo que cambiaste"
        fontSize={"14px"}
        paddingX={"0px"}
        sx={{
            '& .MuiInputBase-input::placeholder': {fontSize: '14px'} // Set placeholder size
        }}
    />

}


function topicTextToMarkdown(text: string, format: string) {
    if(format == "markdown"){
        return {
            text: text, format
        }
    } else if(format == "markdown-compressed"){
        return topicTextToMarkdown(decompress(text), "markdown")
    } else {
        return {text, format}
    }
}


async function getNewVersionDiff(editor: LexicalEditor, topic: ArCabildoabiertoWikiTopicVersion.TopicView) {
    if(!editor) return {
        data: {
            charsDeleted: 0,
            charsAdded: 0
        }
    }
    const state = editor.getEditorState().toJSON()
    const md = editorStateToMarkdown(state)

    const {text: currentText, format: currentFormat} = topicTextToMarkdown(topic.text, topic.format)

    type I = {currentText: string, currentFormat: string, markdown: string, embeds: ArCabildoabiertoFeedArticle.ArticleEmbedView[]}
    type O = {charsAdded: number, charsDeleted: number}

    const params = {
        ...md,
        currentText,
        currentFormat
    }

    return await post<I, O>("/diff", params)
}


export const SaveEditPopup = ({
                                  editor, onClose, onSave, topic, open
                              }: {
    open: boolean
    editor: LexicalEditor
    onClose: () => void
    onSave: (v: boolean, editMsg: string) => Promise<{ error?: string }>,
    topic: ArCabildoabiertoWikiTopicVersion.TopicView
}) => {
    const [claimsAuthorship, setClaimsAuthorship] = useState(true)
    const {user} = useSession()
    const [editMsg, setEditMsg] = useState("")
    const [diff, setDiff] = useState<{isLoading: false, error?: string, diff?: {charsAdded: number, charsDeleted: number}} | {isLoading: true}>({isLoading: true})

    useEffect(() => {
        async function fetchDiff(){
            try {
                const d = await getNewVersionDiff(editor, topic)
                if(d.data) {
                    setDiff({
                        isLoading: false,
                        diff: d.data
                    })
                } else if(d.error || !d){
                    setDiff({
                        isLoading: false,
                        error: d ? d.error : "Ocurrió un error en la conexión con el servidor."
                    })
                }
            } catch {
                setDiff({
                    isLoading: false,
                    error: "Ocurrió un error en la conexión con el servidor."
                })
            }
        }

        if(diff.isLoading){
            fetchDiff()
        }
    }, [diff, editor])

    const infoAuthorship = <span className="link">
        Desactivá este tick si no sos autor/a de los cambios que agregaste. Por ejemplo, si estás sumando al tema el texto de un documento, o un texto extenso escrito por otra persona. Si no estás seguro/a no te preocupes, se puede cambiar después. <Link
        href={topicUrl("Cabildo Abierto: Wiki")}>Más información</Link>
    </span>

    const newVersionSize = useMemo(() => {
        if(editor){
            const state = editor.getEditorState().toJSON()
            const md = editorStateToMarkdown(state)
            return md.markdown.length
        } else {
            return null
        }
    }, [editor])

    if (newVersionSize && newVersionSize > 1200000) {
        return <AcceptButtonPanel
            open={true}
            onClose={onClose}
        >
            <span className={"sm:max-w-[450px]"}>
                No se pueden guardar los cambios porque el tema supera el límite de 1.200.000 caracteres (con <span
                className="text-red-600">{newVersionSize}</span> caracteres). Te sugerimos que separes el contenido en secciones en distintos temas.
            </span>
        </AcceptButtonPanel>
    }

    return (
        <BaseFullscreenPopup open={open} closeButton={true} onClose={onClose}>
            <div className="py-4 lg:px-12 px-2 text-center sm:w-[450px]">

                <h2 className="pb-4 uppercase text-base">
                    Confirmar cambios
                </h2>

                {diff.isLoading == false && diff.diff &&
                    <div className="mb-8">
                        <ChangesCounterWithText charsAdded={diff.diff.charsAdded} charsDeleted={diff.diff.charsDeleted}/>
                    </div>
                }
                {diff.isLoading == false && diff.error &&
                    <div className="mb-8 text-[var(--text-light)]">
                        {diff.error}
                    </div>
                }
                {diff.isLoading == true &&
                    <div className={"h-16"}>
                        <LoadingSpinner/>
                    </div>
                }

                <div className="flex flex-col items-center mb-8 w-full min-w-[300px]">
                    <EditMessageInput value={editMsg} setValue={setEditMsg}/>
                </div>

                {!hasEditPermission(user, getTopicProtection(topic.props)) &&
                    <div className="mb-8">
                        <NotEnoughPermissionsWarning topic={topic}/>
                    </div>
                }

                {diff.isLoading == false && diff.diff && diff.diff.charsAdded > 0 &&
                    <div className="flex justify-center">
                        <TickButton
                            size={18}
                            ticked={claimsAuthorship}
                            setTicked={setClaimsAuthorship}
                            text={
                            <div className="text-sm text-[var(--text-light)] flex space-x-1">
                                <div>Soy autor/a de los caracteres agregados.</div>
                                <InfoPanel
                                    text={infoAuthorship}
                                />
                            </div>}
                        />
                    </div>
                }
                <div className="flex justify-center items-center space-x-4 mt-4">
                    <Button
                        color="transparent"
                        variant="text"
                        onClick={async () => {
                            onClose()
                        }}
                        size={"small"}
                        sx={{":hover": {backgroundColor: "var(--background-dark3)"}}}
                    >
                        Cancelar
                    </Button>
                    <StateButton
                        handleClick={async () => {
                            return await onSave(claimsAuthorship, editMsg)
                        }}
                        size={"small"}
                        variant={"outlined"}
                        text1="Confirmar"
                        disabled={(diff.isLoading == false && !diff.diff) || diff.isLoading == true}
                        disableElevation={true}
                        textClassName={"font-semibold"}
                    />
                </div>
            </div>
        </BaseFullscreenPopup>
    );
};