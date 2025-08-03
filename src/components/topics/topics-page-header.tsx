import {useRouter, useSearchParams} from "next/navigation";
import {ReactNode, useState} from "react";
import {Button} from "../../../modules/ui-utils/src/button";

import SelectionComponent from "@/components/buscar/search-selection-component";
import {GraphIcon, ListBulletsIcon, StackIcon} from "@phosphor-icons/react"

import dynamic from "next/dynamic";
import MainSearchBar from "@/components/buscar/main-search-bar";
import AddIcon from "@mui/icons-material/Add";
import {useSearch} from "@/components/buscar/search-context";
import TopicsSortSelector from "@/components/topics/topic-sort-selector";
import {IconButton} from "../../../modules/ui-utils/src/icon-button";
import DescriptionOnHover from "../../../modules/ui-utils/src/description-on-hover";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {TTOption} from "@/lib/types";

const CreateTopicModal = dynamic(() => import("@/components/topics/topic/create-topic-modal"))

type TopicsViewOption = "mapa" | "lista"

export const TopicsPageHeader = ({sortedBy, setSortedBy, multipleEnabled, setMultipleEnabled}: {
    sortedBy: TTOption
    setSortedBy: (v: TTOption) => void
    multipleEnabled: boolean
    setMultipleEnabled: (v: boolean) => void
}) => {
    const [newTopicOpen, setNewTopicOpen] = useState(false)
    const searchParams = useSearchParams()
    const router = useRouter()
    const c = searchParams.get("c")
    const view = searchParams.get("view")

    const currentView: TopicsViewOption = view && (view == "lista" || view == "mapa") ? view : "lista"

    const {searchState, setSearchState} = useSearch()
    const {isMobile} = useLayoutConfig()

    function optionsNodes(o: TopicsViewOption, isSelected: boolean) {
        let icon: ReactNode
        icon = null
        let description: string
        if (o == "mapa") {
            description = "Ver como mapa"
            icon = isSelected ? <GraphIcon fontSize={"22px"} weight={"bold"}/> : <GraphIcon fontSize={"22px"}/>
        } else if (o == "lista") {
            description = "Ver como lista"
            icon = isSelected ? <ListBulletsIcon fontSize={"22px"} weight={"bold"}/> :
                <ListBulletsIcon fontSize={"22px"}/>
        }
        return (
            <DescriptionOnHover description={description}>
                <button
                    id={o}
                    className={"flex items-center p-1 hover:bg-[var(--background-dark)] rounded " + (isSelected ? "bg-[var(--background-dark2)]" : "")}
                >
                    {icon}
                </button>
            </DescriptionOnHover>
        )
    }

    const searching = searchState.searching
    const onlySearchBar = searching && isMobile

    const searchBar = <MainSearchBar
        autoFocus={false}
        paddingY={"5px"}
        placeholder={"buscar"}
    />

    return <div className="flex justify-between px-2 items-center space-x-1">
        {!onlySearchBar && <div className={"flex space-x-2 flex-1"}>
            <SelectionComponent<TopicsViewOption>
                onSelection={(s: TopicsViewOption) => {
                    router.push("/temas?view=" + s + (c ? "&c=" + c : ""));
                    setSearchState({value: "", searching: false})
                }}
                options={["lista", "mapa"]}
                selected={currentView}
                optionsNodes={optionsNodes}
                className="flex space-x-2"
            />
            <TopicsSortSelector
                sortedBy={sortedBy}
                setSortedBy={setSortedBy}
                disabled={currentView == "mapa"}
            />
            <DescriptionOnHover description={"Habilitar la selección múltiple de categorías."}>
                <IconButton
                    size={"small"}
                    onClick={() => setMultipleEnabled(!multipleEnabled)}
                    color={!multipleEnabled ? "transparent" : "background-dark3"}>
                    <StackIcon/>
                </IconButton>
            </DescriptionOnHover>
        </div>}

        <div className={"flex py-1"} style={{width: onlySearchBar ? "100%" : 256}}>
            {searchBar}
        </div>

        {!onlySearchBar && <div className={"py-1 flex-1 flex justify-end"}>
            <DescriptionOnHover description={"Crear un tema"}>
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
                    id={"new-topic-button"}
                >
                    <span className={"hidden min-[600px]:block"}>Tema</span>
                    <span className={"block min-[600px]:hidden"}>Tema</span>
                </Button>
            </DescriptionOnHover>
        </div>}

        {!onlySearchBar && newTopicOpen &&
            <CreateTopicModal open={newTopicOpen} onClose={() => setNewTopicOpen(false)}/>}
    </div>
}