import {useRouter} from "next/navigation"
import {validEntityName} from "./utils";
import {topicUrl} from "@/utils/uri";
import {createTopic} from "@/components/writing/write-panel/create-topic";
import StateButton from "../../../../modules/ui-utils/src/state-button";


export default function TopicNotFoundPage({id}: { id: string }) {
    const name = decodeURIComponent(id).replaceAll("_", " ")
    const url = topicUrl(id)
    const router = useRouter()

    const handleCreateEntity = async () => {
        const {error} = await createTopic(name)
        if (error) {
            return {error}
        }
        router.push(url)
        return {}
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
                <StateButton
                    variant={"contained"}
                    handleClick={handleCreateEntity}
                    sx={{
                        textTransform: "none"
                    }}
                    text1={`Crear tema "${id}"`}
                />
            </div> :
            <div className="py-16 flex justify-center text-center">
                No se puede crear el tema porque su nombre no es
                válido.
            </div>
        }
    </>
}