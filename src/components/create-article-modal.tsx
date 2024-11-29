import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { createEntity } from "../actions/entities";
import { useUser } from "../app/hooks/user";
import { CreateAccountLink } from "./create-account-link";
import StateButton from "./state-button";
import TickButton from "./tick-button";
import { articleUrl, inputClassName } from "./utils";
import { ErrorMsg, validEntityName } from "./write-button";
import { BaseFullscreenPopup } from "./base-fullscreen-popup";



export const CreateArticleModal = ({ open, onClose }: { open: boolean, onClose: () => void }) => {
    const user = useUser();
    const [entityName, setEntityName] = useState("");
    const [errorOnCreate, setErrorOnCreate] = useState(null)
    const { mutate } = useSWRConfig();
    const router = useRouter();
    const [goToArticle, setGoToArticle] = useState(true);

    return <BaseFullscreenPopup open={open} closeButton={true} onClose={onClose}>
        <div className="space-y-3 px-6 mb-2 flex flex-col items-center">
            <h3>Nuevo tema</h3>
            <div>
                <input
                    className={inputClassName}
                    value={entityName}
                    onChange={(e) => setEntityName(e.target.value)}
                    placeholder="Título"
                />
            </div>
            {errorOnCreate && <ErrorMsg text={errorOnCreate}/>}
            {entityName.includes("/") && <ErrorMsg text="El nombre no puede incluír el caracter '/'."/>}

            <div className="flex justify-center">
            <div className="text-[var(--text-light)] text-xs sm:text-sm text-center max-w-64">
                Antes de crear un nuevo tema fijate que no exista un tema similar.
            </div>
            </div>
            
            <TickButton ticked={goToArticle} setTicked={setGoToArticle} size={20} color="#455dc0" text={<span className="text-gray-800 text-sm">Ir a la página del tema después de crearlo</span>}/>

            <div className="py-4">
                <StateButton
                    handleClick={async () => {
                        setErrorOnCreate(null)
                        const { id, error } = await createEntity(entityName, user.user.id);
                        if(error){
                            if(error == "exists"){
                                setErrorOnCreate("Ya existe ese tema.")
                                return {}
                            } else {
                                return {error}
                            }
                        }
                        mutate("/api/entities")
                        mutate("/api/entity/"+id)
                        if (goToArticle) router.push(articleUrl(id))
                        onClose()
                        return {}
                    }}
                    disabled={!user.user || !validEntityName(entityName)}
                    textClassName="title px-4"
                    text1="Crear"
                />
                {!user.isLoading && !user.user && <CreateAccountLink
                    text="Creá una cuenta o iniciá sesión para crear un tema"
                />}
            </div>

        </div>
    </BaseFullscreenPopup>
};