import {useDrafts} from "@/queries/getters/useDrafts";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import dynamic from "next/dynamic";

const DraftPreviewComp = dynamic(() => import("@/components/writing/drafts/draft-preview"));



export default function Drafts() {
    const {data: drafts, isLoading, error} = useDrafts()

    return <div>
        {drafts && <div className={"space-y-6 mt-8 px-2"}>
            {drafts.map((d, index) => {
                return <div key={index}>
                    <DraftPreviewComp draft={d}/>
                </div>
            })}
        </div>}
        {error && <div className={"text-sm text-[var(--text-light)] mt-16"}>
            Ocurrió un error al cargar los borradores.
        </div>}
        {isLoading && <div className={"mt-16"}>
            <LoadingSpinner/>
        </div>}
        {drafts && drafts.length == 0 && <div className={"text-sm text-center text-[var(--text-light)] mt-16"}>
            No se encontraron borradores.
        </div>}
    </div>
}