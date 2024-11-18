
import { Button } from "@mui/material"
import SelectionComponent from "./search-selection-component"


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
        <div className="">
        {/*showRoute && 
            <div className="flex flex-col pt-1">
                <span className="ml-2 text-sm text-[var(--text-light)]">
                    Estás viendo:
                </span>
                <div className="flex pb-2 items-center px-2">
                    <Route route={route} setRoute={setRoute} selected={selected}/>
                </div>
            </div>
        */}
        <SelectionComponent
            onSelection={onSelection}
            options={["En discusión", "Siguiendo"]}
            selected={selected}
            optionsNodes={optionsNodes}
            className="flex justify-between w-full"
        />
        </div>
    </div>
}