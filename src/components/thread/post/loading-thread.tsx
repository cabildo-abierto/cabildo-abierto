import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";


export const LoadingThread = ({collection}: {collection: string}) => {
    return <div className={"flex flex-col items-center"}>
        <div className={"py-16"}>
            <LoadingSpinner/>
        </div>
    </div>
}