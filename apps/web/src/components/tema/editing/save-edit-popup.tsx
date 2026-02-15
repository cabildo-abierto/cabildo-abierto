import {LexicalEditor} from "lexical";
import {CustomLink as Link} from "@/components/utils/base/custom-link"
import React, {useEffect, useMemo, useState} from "react";
import InfoPanel from "@/components/utils/base/info-panel";
import {NotEnoughPermissionsWarning} from "../permissions-warning";
import {StateButton} from "@/components/utils/base/state-button"
import TickButton from "../../utils/tick-button";
import {ChangesCounterWithText} from "../changes-counter";
import {AcceptButtonPanel} from "../../utils/dialogs/accept-button-panel";
import {topicUrl} from "@/components/utils/react/url";
import {getTopicProtection, hasEditPermission} from "../utils";
import {useSession} from "@/components/auth/use-session";
import {BaseButton} from "@/components/utils/base/base-button";
import {BaseFullscreenPopup} from "../../utils/dialogs/base-fullscreen-popup";
import {post} from "../../utils/react/fetch";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {APIResult, ArCabildoabiertoWikiTopicVersion, DiffOutput, DiffParams} from "@cabildo-abierto/api"
import { BaseTextField } from "@/components/utils/base/base-text-field";
import {editorStateToMarkdown} from "../../editor/markdown-transforms";
import { decompress } from "@cabildo-abierto/editor-core";
import {cn} from "@/lib/utils";
import {useIsMobile} from "@/components/utils/use-is-mobile";


const EditMessageInput = ({value, setValue}: { value: string, setValue: (v: string) => void }) => {
    return <BaseTextField
        value={value}
        size="small"
        onChange={(e) => setValue(e.target.value)}
        placeholder="Una descripción de lo que cambiaste"
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


async function getNewVersionDiff(
    editor: LexicalEditor,
    topic: ArCabildoabiertoWikiTopicVersion.TopicView
): Promise<APIResult<DiffOutput>> {
    if(!editor) return {
        value: {
            charsDeleted: 0,
            charsAdded: 0
        },
        success: true
    }
    const state = editor.getEditorState().toJSON()
    const md = editorStateToMarkdown(state)

    const {text: currentText, format: currentFormat} = topicTextToMarkdown(topic.text, topic.format)

    const params = {
        ...md,
        currentText,
        currentFormat
    }

    return await post<DiffParams, DiffOutput>("/diff", params)
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
    const {isMobile} = useIsMobile()

    useEffect(() => {
        async function fetchDiff(){
            try {
                const d = await getNewVersionDiff(editor, topic)
                if(d.success === true) {
                    setDiff({
                        isLoading: false,
                        diff: d.value
                    })
                } else {
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
        <BaseFullscreenPopup
            open={open}
            closeButton={true}
            onClose={onClose}
            fullscreenOnMobile={false}
        >
            <div className={cn("p-4 lg:px-12 text-center", !isMobile && "w-[450px]")}>

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

                <div className="flex justify-center mb-8 w-full">
                    <div className={"w-full max-w-[400px]"}>
                    <EditMessageInput value={editMsg} setValue={setEditMsg}/>
                    </div>
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
                    <BaseButton
                        onClick={async () => {
                            onClose()
                        }}
                        size={"small"}
                    >
                        Cancelar
                    </BaseButton>
                    <StateButton
                        handleClick={async () => {
                            return await onSave(claimsAuthorship, editMsg)
                        }}
                        size={"small"}
                        variant={"outlined"}
                        disabled={(diff.isLoading == false && !diff.diff) || diff.isLoading == true}
                        textClassName={"font-semibold"}
                    >
                        Confirmar
                    </StateButton>
                </div>
            </div>
        </BaseFullscreenPopup>
    );
};