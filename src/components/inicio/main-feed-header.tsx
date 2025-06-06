import SelectionComponent from "@/components/buscar/search-selection-component"
import {MobileHeader} from "../layout/mobile-header";
import {optionToSearchParam} from "@/components/inicio/main-page";
import { Button } from "../../../modules/ui-utils/src/button";


export const MainFeedHeader = ({
   selected, onSelection
}: {
    selected: string
    onSelection: (v: string) => void
}) => {

    function optionsNodes(o: string, isSelected: boolean){
        const id = optionToSearchParam(o)

        return <div className="text-[var(--text)]" id={id}>
            <Button
                variant="text"
                color="background"
                sx={{
                    paddingY: 0,
                    borderRadius: 0
                }}
            >
                <div className={"whitespace-nowrap min-[500px]:mx-4 pb-1 pt-2 font-semibold border-b-[4px] " + (isSelected ? "border-[var(--primary)] text-[var(--text)] border-b-[4px]" : "border-transparent text-[var(--text-light)]")}>
                    {o}
                </div>
            </Button>
        </div>
    }

    return <div className="flex flex-col border-b">
        <MobileHeader/>
        <div className={"flex"}>
            <SelectionComponent
                onSelection={onSelection}
                options={["Siguiendo", "En discusión"]}
                selected={selected}
                optionsNodes={optionsNodes}
                className="flex"
            />
        </div>
    </div>
}