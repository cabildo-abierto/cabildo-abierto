
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
        return <div className="pr-1"><Button
                onClick={() => {}}
                variant="contained"
                color="primary"
                fullWidth={true}
                disableElevation={true}
                sx={{textTransform: "none"}}
            >
                <div className={"text-lg title relative after:content-[''] after:block after:h-[4px] after:rounded-full after:w-full after:mt-[-2px] " + (isSelected ? "after:bg-white" : "after:bg-transparent")}>{o}</div>
        </Button></div>
    }

    return <div className="mt-2">
        <SelectionComponent
            onSelection={onSelection}
            options={["Siguiendo", "En discusión"]}
            selected={selected}
            optionsNodes={optionsNodes}
            className="flex justify-between w-full"
        />
    </div>
}