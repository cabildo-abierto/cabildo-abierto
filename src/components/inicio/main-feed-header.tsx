import SelectionComponent from "@/components/buscar/search-selection-component"
import {MobileHeader} from "../layout/mobile-header";
import {
    mainFeedOptionToSearchParam,
    useEnDiscusionParams,
    useFollowingParams
} from "@/components/inicio/main-page";
import {Button} from "../../../modules/ui-utils/src/button";
import {SlidersHorizontalIcon} from "@phosphor-icons/react";
import {useRef} from "react";
import InfoPanel from "../../../modules/ui-utils/src/info-panel";
import {topicUrl} from "@/utils/uri";
import {updateSearchParam} from "@/utils/fetch";
import {ClickableModalOnClick} from "../../../modules/ui-utils/src/popover";
import {useSession} from "@/queries/useSession";
import {FeedFormatOption, FollowingFeedFilterOption} from "@/lib/types";


const EnDiscusionFeedConfig = () => {
    const {user} = useSession()
    const {metric, time, format} = useEnDiscusionParams(user)

    function setMetric(v: string) {
        updateSearchParam("m", v)
    }

    function setTime(v: string) {
        updateSearchParam("p", v)
    }

    function setFormat(v: string) {
        updateSearchParam("formato", v)
    }

    function optionsNodes(o: string, selected: boolean) {
        return <button
            className={"text-sm rounded-lg px-2 cursor-pointer " + (selected ? "bg-[var(--primary)] text-[var(--button-text)]" : "bg-[var(--background-dark2)] text-[var(--text)]")}
        >
            {o}
        </button>
    }

    return <div className={"space-y-4 pt-2"}>
        <div>
            <div className={"text-xs text-[var(--text-light)]"}>
                Métrica
            </div>
            <SelectionComponent
                onSelection={setMetric}
                options={["Interacciones", "Recientes", "Me gustas", "Popularidad relativa"]}
                optionsNodes={optionsNodes}
                selected={metric}
                className={"flex gap-x-2 gap-y-1 flex-wrap"}
                optionContainerClassName={""}
            />
        </div>
        {metric != "Recientes" && <div>
            <div className={"text-xs text-[var(--text-light)]"}>
                Período
            </div>
            <SelectionComponent
                onSelection={setTime}
                options={["Último día", "Última semana", "Último mes"]}
                optionsNodes={optionsNodes}
                selected={time}
                className={"flex gap-x-2 gap-y-1 flex-wrap"}
                optionContainerClassName={""}
            />
        </div>}
        <div>
            <div className={"text-xs text-[var(--text-light)]"}>
                Formato
            </div>
            <SelectionComponent
                onSelection={setFormat}
                options={["Todos", "Artículos"]}
                optionsNodes={optionsNodes}
                selected={format}
                className={"flex gap-x-2 gap-y-1 flex-wrap"}
                optionContainerClassName={""}
            />
        </div>
    </div>
}


const SiguiendoFeedConfig = () => {
    const {user} = useSession()
    const {filter, format} = useFollowingParams(user)

    function setFilter(v: FollowingFeedFilterOption) {
        updateSearchParam("filtro", v)
    }

    function setFormat(v: FeedFormatOption) {
        updateSearchParam("formato", v)
    }

    function optionsNodes(o: string, selected: boolean) {
        return <button
            className={"text-sm rounded-lg px-2 cursor-pointer " + (selected ? "bg-[var(--primary)] text-[var(--button-text)]" : "bg-[var(--background-dark2)] text-[var(--text)]")}
        >
            {o}
        </button>
    }

    function onSelection(v: string) {
        if (v == "Todos") {
            setFilter("Todos")
            setFormat("Todos")
        } else if (v == "Cabildo Abierto") {
            setFilter("Solo Cabildo Abierto")
            setFormat("Todos")
        } else if (v == "Artículos") {
            setFilter("Solo Cabildo Abierto")
            setFormat("Artículos")
        }
    }

    const selected = format == "Artículos" ? "Artículos" : (filter == "Solo Cabildo Abierto" ? "Cabildo Abierto" : "Todos")

    return <div className={"space-y-2"}>
        <SelectionComponent
            onSelection={onSelection}
            options={["Todos", "Cabildo Abierto", "Artículos"]}
            optionsNodes={optionsNodes}
            selected={selected}
            className={"flex gap-x-2 gap-y-1 flex-wrap"}
            optionContainerClassName={""}
        />
    </div>
}


const FeedConfig = ({selected}: { selected: MainFeedOption }) => {
    const buttonRef = useRef<HTMLButtonElement>(null)

    const modal = (close: () => void) => (
        <div className={"p-3 space-y-2 bg-[var(--background-dark)] w-56"}>
            <div className={"w-full flex justify-between items-end"}>
                <div className={"text-sm text-[var(--text)]"}>
                    Configurar <span className={"font-semibold text-[var(--text-light)]"}
                >
                    {selected}
                </span>
                </div>
                <InfoPanel onClick={() => {
                    window.open(topicUrl("Cabildo Abierto: Muros"), "_blank")
                }}/>
            </div>
            {selected == "En discusión" && <EnDiscusionFeedConfig/>}
            {selected == "Siguiendo" && <SiguiendoFeedConfig/>}
        </div>
    )

    return <ClickableModalOnClick
        modal={modal}
        id={"feed-config"}
    >
        <button id="feed-config-button" ref={buttonRef} className={"hover:bg-[var(--background-dark)] rounded p-1"}>
            <SlidersHorizontalIcon size={22}/>
        </button>
    </ClickableModalOnClick>
}


export type MainFeedOption = "En discusión" | "Siguiendo" | "Descubrir" | "Artículos"


export const MainFeedHeader = ({
                                   selected, onSelection
                               }: {
    selected: MainFeedOption
    onSelection: (v: MainFeedOption) => void
}) => {

    function optionsNodes(o: MainFeedOption, isSelected: boolean) {
        const id = mainFeedOptionToSearchParam(o)

        return <div className="text-[var(--text)]" id={id}>
            <Button
                variant="text"
                color="background"
                sx={{
                    paddingY: 0,
                    borderRadius: 0
                }}
            >
                <div
                    className={"whitespace-nowrap sm:text-[15px] text-[16px] min-[500px]:mx-4 pb-1 mx-2 pt-2 font-semibold border-b-[4px] " + (isSelected ? "border-[var(--primary)] text-[var(--text)] border-b-[4px]" : "border-transparent text-[var(--text-light)]")}>
                    {o}
                </div>
            </Button>
        </div>
    }

    return <div className="flex flex-col border-b">
        <MobileHeader/>
        <div className={"flex justify-between items-center pr-1"}>
            <SelectionComponent<MainFeedOption>
                onSelection={onSelection}
                options={["Siguiendo", "En discusión"]}
                selected={selected}
                optionsNodes={optionsNodes}
                className="flex"
            />
            <FeedConfig selected={selected}/>
        </div>
    </div>
}