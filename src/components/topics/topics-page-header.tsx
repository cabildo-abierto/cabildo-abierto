import {useRouter, useSearchParams} from "next/navigation";
import {ReactNode, useState} from "react";
import {Button} from "../../../modules/ui-utils/src/button";

import SelectionComponent from "@/components/buscar/search-selection-component";
import {GraphIcon, ListBulletsIcon, StackIcon} from "@phosphor-icons/react"

import dynamic from "next/dynamic";
import MainSearchBar from "@/components/buscar/main-search-bar";
import AddIcon from "@mui/icons-material/Add";
import {useSearch} from "@/components/buscar/search-context";
import TopicsSortSelector, {TopicsSortOrder} from "@/components/topics/topic-sort-selector";
import {IconButton} from "../../../modules/ui-utils/src/icon-button";
import DescriptionOnHover from "../../../modules/ui-utils/src/description-on-hover";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import { pxToNumber } from "@/utils/strings";

const CreateTopicModal = dynamic(() => import("@/components/topics/topic/create-topic-modal"))

export const TopicsPageHeader = ({sortedBy, setSortedBy, multipleEnabled, setMultipleEnabled}: {
    sortedBy: TopicsSortOrder
    setSortedBy: (v: TopicsSortOrder) => void
    multipleEnabled: boolean
    setMultipleEnabled: (v: boolean) => void
}) => {
    const [newTopicOpen, setNewTopicOpen] = useState(false)
    const searchParams = useSearchParams()
    const router = useRouter()
    const c = searchParams.get("c")
    const view = searchParams.get("view")
    const {searchState, setSearchState} = useSearch()
    const {layoutConfig} = useLayoutConfig()

    function optionsNodes(o: string, isSelected: boolean) {
        let icon: ReactNode
        icon = null
        if (o == "mapa") {
            icon = isSelected ? <GraphIcon fontSize={"22px"} weight={"bold"}/> : <GraphIcon fontSize={"22px"}/>
        } else if (o == "lista") {
            icon = isSelected ? <ListBulletsIcon fontSize={"22px"} weight={"bold"}/> :
                <ListBulletsIcon fontSize={"22px"}/>
        }
        return <button
            className={"flex items-center p-1 hover:bg-[var(--background-dark)] rounded " + (isSelected ? "bg-[var(--background-dark2)]" : "")}>
            {icon}
        </button>
    }

    const searching = searchState.searching
    const isMobile = pxToNumber(layoutConfig.maxWidthCenter) <= 600
    const onlySearchBar = searching && isMobile

    const searchBar = <MainSearchBar
        autoFocus={false}
        paddingY={"5px"}
        placeholder={"buscar un tema"}
    />

    return <div className="flex justify-between px-2 items-center space-x-1">
        {!onlySearchBar && <div className={"flex space-x-2 flex-1"}>
            <SelectionComponent
                onSelection={(s: string) => {
                    router.push("/temas?view=" + s + (c ? "&c=" + c : ""));
                    setSearchState({value: "", searching: false})
                }}
                options={["lista", "mapa"]}
                selected={view ? view : "lista"}
                optionsNodes={optionsNodes}
                className="flex space-x-2"
            />
            <TopicsSortSelector sortedBy={sortedBy} setSortedBy={setSortedBy}/>
            <DescriptionOnHover description={"Habilitar la selección múltiple para obtener la intersección de las categorías."}>
                <IconButton
                    size={"small"}
                    onClick={() => setMultipleEnabled(!multipleEnabled)}
                    color={!multipleEnabled ? "transparent" : "background-dark"}>
                    <StackIcon/>
                </IconButton>
            </DescriptionOnHover>
        </div>}

        <div className={"flex py-1"} style={{width: onlySearchBar ? "100%" : 256}}>
            {searchBar}
        </div>

        {!onlySearchBar && <div className={"py-1 flex-1 flex justify-end"}>
            <Button
                color="background"
                variant="text"
                disableElevation={true}
                startIcon={<AddIcon/>}
                size={"small"}
                sx={{textTransform: "none", height: "32px", borderRadius: 20, padding: "0 10px"}}
                onClick={() => {
                    setNewTopicOpen(true)
                }}
            >
                <span className={"hidden min-[600px]:block"}>Tema</span>
                <span className={"block min-[600px]:hidden"}>Tema</span>
            </Button>
        </div>}

        {!onlySearchBar && newTopicOpen && <CreateTopicModal open={newTopicOpen} onClose={() => setNewTopicOpen(false)}/>}
    </div>
}