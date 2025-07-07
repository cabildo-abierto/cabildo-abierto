import SelectionComponent from "@/components/buscar/search-selection-component"
import {MobileHeader} from "../layout/mobile-header";
import {optionToSearchParam, useEnDiscusionParams} from "@/components/inicio/main-page";
import {Button} from "../../../modules/ui-utils/src/button";
import {SlidersHorizontalIcon} from "@phosphor-icons/react";
import {Select} from "../../../modules/ui-utils/src/select";
import {useRef} from "react";
import InfoPanel from "../../../modules/ui-utils/src/info-panel";
import {topicUrl} from "@/utils/uri";
import {updateSearchParam} from "@/utils/fetch";
import {ClickableModalOnClick} from "../../../modules/ui-utils/src/popover";


const FeedConfig = () => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const {metric, time} = useEnDiscusionParams()

    function setMetric(v: string){
        updateSearchParam("m", v)
    }

    function setTime(v: string){
        updateSearchParam("p", v)
    }

    const modal = (close: () => void) => (
        <div className={"p-2 space-y-4 bg-[var(--background-dark)] border w-56"}>
            <div className={"w-full flex justify-between items-end space-x-8"}>
                <div className={"text-sm text-[var(--text)]"}>
                    Configurar <span className={"font-semibold text-[var(--text-light)]"}>En discusión</span>
                </div>
                <InfoPanel onClick={() => {
                    window.open(topicUrl("Cabildo Abierto: Muros"), "_blank")
                }}/>
            </div>
            <div className={"space-y-4"}>
                <Select
                    options={["Popularidad relativa", "Me gustas", "Interacciones", "Recientes"]}
                    onChange={setMetric}
                    value={metric}
                    label={"Métrica"}
                    fontSize={"14px"}
                    labelShrinkFontSize={"14px"}
                    textClassName={"text-sm text-[var(--text)]"}
                />
                <Select
                    options={["Último día", "Última semana", "Último mes"]}
                    onChange={setTime}
                    value={time}
                    fontSize={"14px"}
                    labelShrinkFontSize={"14px"}
                    label={"Período"}
                    textClassName={"text-sm text-[var(--text)]"}
                />
            </div>
        </div>
    )

    return <ClickableModalOnClick
        modal={modal}
        id={"feed-config"}
    >
        <button ref={buttonRef} className={"hover:bg-[var(--background-dark)] rounded p-1"}>
            <SlidersHorizontalIcon size={22}/>
        </button>
    </ClickableModalOnClick>
}


export const MainFeedHeader = ({
                                   selected, onSelection
                               }: {
    selected: string
    onSelection: (v: string) => void
}) => {

    function optionsNodes(o: string, isSelected: boolean) {
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
                <div
                    className={"whitespace-nowrap min-[500px]:mx-4 pb-1 pt-2 font-semibold border-b-[4px] " + (isSelected ? "border-[var(--primary)] text-[var(--text)] border-b-[4px]" : "border-transparent text-[var(--text-light)]")}>
                    {o}
                </div>
            </Button>
        </div>
    }

    return <div className="flex flex-col border-b">
        <MobileHeader/>
        <div className={"flex justify-between items-center pr-1"}>
            <SelectionComponent
                onSelection={onSelection}
                options={["Siguiendo", "En discusión"]}
                selected={selected}
                optionsNodes={optionsNodes}
                className="flex"
            />
            {selected == "En discusión" && <FeedConfig/>}
        </div>
    </div>
}