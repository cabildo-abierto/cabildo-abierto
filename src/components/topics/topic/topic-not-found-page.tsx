import {useTopic} from "@/queries/useTopic";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";


export default function TopicNotFoundPage({id}: { id: string }) {
    const name = decodeURIComponent(id).replaceAll("_", " ")
    const {isLoading, isRefetching} = useTopic(id)

    if(isLoading || isRefetching) {
        return <div className={"py-32"}>
            <LoadingSpinner/>
        </div>
    }

    return <>
        <div className="flex justify-center mt-32">
            <h2>No se encontró el tema</h2>
        </div>
        <div className="flex justify-center py-8 text-lg">
            {'"' + name + '"'}
        </div>
    </>
}