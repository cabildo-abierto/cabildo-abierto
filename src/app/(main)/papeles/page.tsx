"use client"


import PageHeader from "../../../../modules/ui-utils/src/page-header";
import SelectionComponent from "@/components/buscar/search-selection-component";
import {useSearchParams} from "next/navigation";
import {updateSearchParam} from "@/utils/fetch";
import { Button } from "../../../../modules/ui-utils/src/button";
import Drafts from "@/components/writing/drafts/drafts";

export type YourPaperOptions = "borradores" | "guardados"

const Page = () => {
    const params = useSearchParams()
    const selectedParam = params.get("s")
    const selected = (selectedParam == "borradores" || selectedParam == "guardados") ? selectedParam : "borradores"

    function optionsNodes(o: YourPaperOptions, isSelected: boolean) {
        return <div className="text-[var(--text)]">
            <Button
                variant="text"
                color="background"
                sx={{
                    paddingY: 0,
                    borderRadius: 0
                }}
            >
                <div
                    className={"capitalize whitespace-nowrap min-[500px]:mx-4 pb-1 pt-2 font-semibold border-b-[4px] " + (isSelected ? "border-[var(--primary)] text-[var(--text)] border-b-[4px]" : "border-transparent text-[var(--text-light)]")}>
                    {o}
                </div>
            </Button>
        </div>
    }

    function onSelection(selected: YourPaperOptions) {
        updateSearchParam("s", selected)
    }

    return <div>
        <PageHeader title={"Tus papeles"}/>
        <div className={"border-b"}>
            <SelectionComponent<YourPaperOptions>
                onSelection={onSelection}
                selected={selected}
                options={["borradores", "guardados"]}
                optionsNodes={optionsNodes}
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