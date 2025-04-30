import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {topicUrl} from "@/utils/uri";
import Link from "next/link";
import {TextField} from "@mui/material";
import {ErrorMsg} from "@/utils/utils";
import TickButton from "../../../../modules/ui-utils/src/tick-button";
import StateButton from "../../../../modules/ui-utils/src/state-button";
import {validEntityName} from "@/components/topics/topic/utils";
import {useSession} from "@/hooks/api";
import {Button} from "../../../../modules/ui-utils/src/button";
import {post} from "@/utils/fetch";


export const createTopic = async (id: string) => {
    return await post<{id: string}, {}>(`/topic-version`, {id})
}


export const CreateTopic = ({onClose, initialSelected="none"}: {onClose: () => void, initialSelected?: string}) => {
    const user = useSession();
    const [topicName, setTopicName] = useState("");
    const [errorOnCreate, setErrorOnCreate] = useState(null)
    const router = useRouter()
    const [goToArticle, setGoToArticle] = useState(true)
    const [selected, setSelected] = useState(initialSelected)

    async function onSubmit(){
        setErrorOnCreate(null)
        const { error } = await createTopic(topicName)

        if(error){
            if(error == "exists"){
                setErrorOnCreate("Ya existe ese tema.")
                return {}
            } else {
                return {error}
            }
        }
        if (goToArticle) router.push(topicUrl(topicName))
        onClose()
        return {}
    }

    if(selected == "none"){
        return <div className={"flex justify-center items-center min-h-64"}>
            <div className={"flex space-x-8 h-full"}>
                <Link href={"/temas"}>
                    <Button
                        sx={{width: "128px"}}
                    >
                        Editar un tema
                    </Button>
                </Link>
                <Button
                    onClick={() => {setSelected("new")}}
                    sx={{width: "128px"}}
                >
                    Nuevo tema
                </Button>
            </div>
        </div>
    }

    return <div className="space-y-3 px-6 mb-2 flex flex-col items-center">
        <div className={"mt-6"}>
            <TextField
                value={topicName}
                label={"Título"}
                size={"small"}
                onChange={(e) => setTopicName(e.target.value)}
                placeholder="Título"
                inputProps={{
                    autoComplete: 'off'
                }}
            />
        </div>
        {errorOnCreate && <ErrorMsg text={errorOnCreate}/>}
        {topicName.includes("/") && <ErrorMsg text="El nombre no puede incluír el caracter '/'."/>}

        <div className="flex justify-center">
            <div className="text-[var(--text-light)] text-xs sm:text-sm text-center max-w-64">
                Antes de crear un nuevo tema mirá que no exista un tema similar.
            </div>
        </div>

        <TickButton
            ticked={goToArticle}
            setTicked={setGoToArticle}
            size={20}
            color="#455dc0"
            text={<div className="text-sm text-[var(--text-light)]">
                Ir a la página del tema después de crearlo
            </div>}
        />

        <div className="py-4 space-x-2 text-[var(--text-light)]">
            <Button
                onClick={() => {setSelected("none")}}
                variant={"text"}
                color={"inherit"}
            >
                Volver
            </Button>
            <StateButton
                handleClick={onSubmit}
                disabled={!user.user || !validEntityName(topicName)}
                textClassName="font-bold px-4"
                text1="Crear tema"
            />
        </div>

    </div>
}