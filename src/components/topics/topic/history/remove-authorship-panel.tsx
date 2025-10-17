import {CustomLink as Link} from '../../../layout/utils/custom-link';
import React from "react"
import StateButton from "../../../layout/utils/state-button"
import {AcceptButtonPanel} from "../../../layout/utils/accept-button-panel"
import {BaseFullscreenPopup} from "../../../layout/utils/base-fullscreen-popup"
import {useSession} from "@/queries/getters/useSession";
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index";


export const RemoveAuthorshipPanel = ({topicHistory, version, onClose, onRemove}: {
    topicHistory: ArCabildoabiertoWikiTopicVersion.TopicHistory,
    onClose: () => void,
    version: number,
    onRemove: () => Promise<{ error?: string }>
}) => {
    const {user} = useSession()

    async function handleClick() {
        const {error} = await onRemove()
        if (error) return {error}
        onClose()
        return {}
    }

    const topicVersion = topicHistory.versions[version]

    if (user.editorStatus != "Administrator" && user.did != topicVersion.author.did) {
        return <AcceptButtonPanel open={true} onClose={onClose}>
            <div className="">
                <div>
                    Por ahora no podés remover la autoría de ediciones de otros usuarios.
                </div>
                <div className="link">
                    Podés deshacer el cambio, sugerir que se remueva la autoría en un comentario, o hablar directamente
                    con el <Link href="/soporte">soporte</Link>.
                </div>
            </div>
        </AcceptButtonPanel>
    }

    return (
        <>
            <BaseFullscreenPopup open={true}>
                <div className="px-6 pb-4">
                    <h2 className="py-4 text-lg">Remover autoría de esta versión</h2>
                    <div className="mb-8">
                        Estás por remover la autoría de tu edición.
                    </div>
                    <div className="flex justify-center items-center space-x-4 mt-4">
                        <button
                            className="gray-btn w-48"
                            onClick={async () => {
                                onClose()
                            }}
                        >
                            Cancelar
                        </button>
                        <StateButton
                            className="gray-btn w-48"
                            handleClick={handleClick}
                            text1="Confirmar"
                        />
                    </div>
                </div>
            </BaseFullscreenPopup>
        </>
    );
};
