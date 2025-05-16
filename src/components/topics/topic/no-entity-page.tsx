"use client"

import {useRouter} from "next/navigation"
import {validEntityName} from "./utils";
import {topicUrl} from "@/utils/uri";
import {useSession} from "@/queries/api";
import {createTopic} from "@/components/writing/write-panel/create-topic";
import {Button} from "../../../../modules/ui-utils/src/button";

const CreateEntityButton = ({onClick, id}: { onClick: () => void, id: string }) => {
    return <Button
        variant={"contained"}
        onClick={onClick}
        sx={{
            textTransform: "none"
        }}

    >
        Crear tema &#34;{id}&#34;
    </Button>
}

export default function NoEntityPage({id}: { id: string }) {
    const name = decodeURIComponent(id).replaceAll("_", " ")
    const url = topicUrl(id)
    const router = useRouter()
    const {user} = useSession()

    const handleCreateEntity = async () => {
        if (user) {
            await createTopic(name)
            // mutate("/api/topics")
            router.push(url)
        }
    }

    return <>
        <div className="flex justify-center mt-32">
            <h2>No se encontró el tema</h2>
        </div>
        <div className="flex justify-center py-8 text-lg">
            {'"' + name + '"'}
        </div>
        {validEntityName(name) ?
            <div className="flex justify-center py-16">
                <CreateEntityButton onClick={handleCreateEntity} id={id}/>
            </div> :
            <div className="py-16 flex justify-center text-center">Tampoco se puede crear el tema porque su nombre no es
                válido.</div>}
    </>
}