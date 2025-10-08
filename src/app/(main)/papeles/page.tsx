"use client"
import SelectionComponent from "@/components/buscar/search-selection-component";
import {useSearchParams} from "next/navigation";
import {updateSearchParam} from "@/utils/fetch";
import Drafts from "@/components/writing/drafts/drafts";
import {feedOptionNodes} from "@/components/config/feed-option-nodes";

export type YourPapersOptions = "borradores" | "guardados"

const Page = () => {
    const params = useSearchParams()
    const selectedParam = params.get("s")
    const selected = (selectedParam == "borradores" || selectedParam == "guardados") ? selectedParam : "borradores"

    function onSelection(selected: YourPapersOptions) {
        updateSearchParam("s", selected)
    }

    return <div className={"mb-32"}>
        <div className={"border-b border-[var(--accent-dark)]"}>
            <SelectionComponent<YourPapersOptions>
                onSelection={onSelection}
                selected={selected}
                options={["borradores", "guardados"]}
                optionsNodes={feedOptionNodes(40)}
                className={"flex justify-start w-32"}
            />
        </div>
        {selected == "guardados" && <div className={"text-center text-[var(--text-light)] mt-16 text-sm"}>
            Próximamente...
        </div>}
        {selected == "borradores" && <Drafts/>}
    </div>
}


export default Page