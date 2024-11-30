
import { Button } from "@mui/material"
import SelectionComponent from "./search-selection-component"
import { Route } from "./wiki-categories"


type MainFeedHeaderProps = {
    route: string[]
    setRoute: (v: string[]) => void
    selected: string
    onSelection: (v: string) => void
    showRoute: boolean
    order: string
    setOrder: (v: string) => void
    filter: string
    setFilter: (v: string) => void    
}


export const MainFeedHeader = ({
    route, setRoute, selected, onSelection, showRoute, order, setOrder, filter, setFilter
}: MainFeedHeaderProps) => {

    function optionsNodes(o: string, isSelected: boolean){
        return <div className="text-[var(--text)] w-32">
            <Button
                onClick={() => {}}
                variant="text"
                color="inherit"
                fullWidth={true}
                disableElevation={true}
                sx={{textTransform: "none",
                    paddingY: 0

                }}
            >
                <div className={"pb-1 pt-2 border-b-[4px] " + (isSelected ? "border-[var(--primary)] font-semibold border-b-[4px]" : "border-transparent")}>
                    {o}
                </div>
            </Button>
        </div>
    }

    return <div className="flex">
        <SelectionComponent
            onSelection={onSelection}
            options={["Siguiendo", "En discusión"]}
            selected={selected}
            optionsNodes={optionsNodes}
            className="flex justify-between"
        />
    </div>
}