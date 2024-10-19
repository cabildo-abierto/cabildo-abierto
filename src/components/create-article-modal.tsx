import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { createEntity } from "../actions/entities";
import { useUser } from "../app/hooks/user";
import { CreateAccountLink } from "./create-account-link";
import StateButton from "./state-button";
import TickButton from "./tick-button";
import { articleUrl } from "./utils";
import { ErrorMsg, validEntityName } from "./write-button";
import { BaseFullscreenPopup } from "./base-fullscreen-popup";



export const CreateArticleModal = ({ onClose }: { onClose: () => void }) => {
    const user = useUser();
    const [entityName, setEntityName] = useState("");
    const [alreadyExists, setAlreadyExists] = useState(false)
    const { mutate } = useSWRConfig();
    const router = useRouter();
    const [goToArticle, setGoToArticle] = useState(true);

    return <BaseFullscreenPopup closeButton={true} onClose={onClose}>
        <div className="space-y-3 px-6 mb-2">
            <h3>Nuevo tema</h3>
            <div>
                <input
                    className="custom-input"
                    value={entityName}
                    onChange={(e) => setEntityName(e.target.value)}
                    placeholder="Título"
                />
            </div>
            {alreadyExists && <ErrorMsg text="Ya existe ese tema."/>}
            {entityName.includes("/") && <ErrorMsg text="El nombre no puede incluír el caracter '/'."/>}

            <TickButton ticked={goToArticle} setTicked={setGoToArticle} size={20} color="#455dc0" text={<span className="text-gray-800 text-sm">Ir a la página del tema después de crearlo</span>}/>
            <div className="py-4">
                <StateButton
                    handleClick={async (e) => {
                        if (user.user) {
                            setAlreadyExists(false)
                            const { id, error } = await createEntity(entityName, user.user.id);
                            if(error){
                                setAlreadyExists(true)
                                return false
                            }
                            mutate("/api/entities");
                            mutate("/api/entity/"+id);
                            if (goToArticle) router.push(articleUrl(id));
                            onClose();
                            return true
                        }
                        return false
                    }}
                    disabled={!user.user || !validEntityName(entityName)}
                    className="gray-btn w-full"
                    text1="Crear"
                    text2="Creando..."
                />
                {!user.isLoading && !user.user && <CreateAccountLink
                    text="Creá una cuenta o iniciá sesión para crear un tema"
                />}
            </div>
        </div>
    </BaseFullscreenPopup>
};