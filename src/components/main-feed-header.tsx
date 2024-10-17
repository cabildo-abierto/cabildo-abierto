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

    return <div className="mt-2">
        <div className="content-container mb-1">
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
            className="main-feed text-sm sm:text-base"
        />
        </div>
    </div>
}