"use client"

import {useRouter} from "next/navigation"
import {Button} from "@mui/material";
import {validEntityName} from "./utils";
import {topicUrl} from "@/utils/uri";
import {useSession} from "@/hooks/api";
import {createTopic} from "@/components/writing/write-panel/create-topic";

const CreateEntityButton: React.FC<any> = ({onClick}) => {
    return <Button
        variant={"contained"}
        onClick={onClick}
        sx={{
            textTransform: "none",
            color: "var(--text)"
        }}

    >
        Crear tema
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
        <div className="flex justify-center py-8">
            <h1>No se encontró el tema</h1>
        </div>
        <div className="flex justify-center py-8 text-lg">
            {'"' + name + '"'}
        </div>
        {validEntityName(name) ?
            <div className="flex justify-center py-16">
                <CreateEntityButton onClick={handleCreateEntity}/>
            </div> :
            <div className="py-16 flex justify-center text-center">Tampoco se puede crear el tema porque su nombre no es
                válido.</div>}
    </>
}