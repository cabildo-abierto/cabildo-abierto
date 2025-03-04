import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { useUser } from "../../hooks/user";
import { CreateAccountLink } from "../auth/create-account-link";
import StateButton from "../ui-utils/state-button";
import TickButton from "../ui-utils/tick-button";
import {topicUrl, ErrorMsg, validEntityName} from "../utils/utils";
import { BaseFullscreenPopup } from "../ui-utils/base-fullscreen-popup";
import {TextField} from "@mui/material";
import {createTopic} from "../../actions/write/topic";



export const CreateTopicModal = ({ open, onClose }: { open: boolean, onClose: () => void }) => {
    const user = useUser();
    const [topicName, setTopicName] = useState("");
    const [errorOnCreate, setErrorOnCreate] = useState(null)
    const { mutate } = useSWRConfig();
    const router = useRouter();
    const [goToArticle, setGoToArticle] = useState(true);

    async function onSubmit(){
        setErrorOnCreate(null)
        const { error } = await createTopic(topicName);

        if(error){
            if(error == "exists"){
                setErrorOnCreate("Ya existe ese tema.")
                return {}
            } else {
                return {error}
            }
        }
        //mutate("/api/entities")
        //mutate("/api/entity/"+topicName)
        if (goToArticle) router.push(topicUrl(topicName))
        onClose()
        return {}
    }

    return <BaseFullscreenPopup open={open} closeButton={true} onClose={onClose}>
        <div className="space-y-3 px-6 mb-2 flex flex-col items-center">
            <div className={"text-xl"}>Nuevo tema</div>
            <div>
                <TextField
                    value={topicName}
                    label={"Título"}
                    size={"small"}
                    onChange={(e) => setTopicName(e.target.value)}
                    placeholder="Título"
                    inputProps={{
                        autoComplete: 'off', // Disables browser autocomplete
                    }}
                />
            </div>
            {errorOnCreate && <ErrorMsg text={errorOnCreate}/>}
            {topicName.includes("/") && <ErrorMsg text="El nombre no puede incluír el caracter '/'."/>}

            <div className="flex justify-center">
            <div className="text-[var(--text-light)] text-xs sm:text-sm text-center max-w-64">
                Antes de crear un nuevo tema fijate que no exista un tema similar.
            </div>
            </div>
            
            <TickButton ticked={goToArticle} setTicked={setGoToArticle} size={20} color="#455dc0" text={<span className="text-sm">Ir a la página del tema después de crearlo</span>}/>

            <div className="py-4">
                <StateButton
                    handleClick={onSubmit}
                    disabled={!user.user || !validEntityName(topicName)}
                    textClassName="font-semibold px-4"
                    text1="Crear"
                    disableElevation={true}
                />
                {!user.isLoading && !user.user && <CreateAccountLink
                    text="Creá una cuenta o iniciá sesión para crear un tema"
                />}
            </div>

        </div>
    </BaseFullscreenPopup>
};