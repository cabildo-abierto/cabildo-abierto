import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {ReactNode, useState} from "react";
import {BaseButton} from "../layout/base/baseButton";
import SelectionComponent from "@/components/buscar/search-selection-component";
import {GraphIcon, ListBulletsIcon, PlusIcon} from "@phosphor-icons/react"
import dynamic from "next/dynamic";
import MainSearchBar from "@/components/buscar/main-search-bar";
import {useSearch} from "@/components/buscar/search-context";
import TopicsSortSelector from "@/components/topics/topic-sort-selector";
import DescriptionOnHover from "../layout/utils/description-on-hover";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {useTopicsPageParams} from "@/components/config/topics";
import {updateSearchParam} from "@/utils/fetch";
import { cn } from "@/lib/utils";

const CreateTopicModal = dynamic(() => import("@/components/topics/topic/create-topic-modal"))

type TopicsViewOption = "mapa" | "lista"

export const TopicsPageHeader = () => {
    const {sortedBy} = useTopicsPageParams()
    const [newTopicOpen, setNewTopicOpen] = useState(false)
    const searchParams = useSearchParams()
    const {isMobile} = useLayoutConfig()
    const router = useRouter()
    const c = searchParams.get("c")
    const view = searchParams.get("view")

    const currentView: TopicsViewOption = view && (view == "lista" || view == "mapa") ? view : "lista"
    const pathname = usePathname()
    const {setSearchState} = useSearch(`${pathname}::topics`)

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
                    className={"flex items-center p-1 hover:bg-[var(--background-dark)] " + (isSelected ? "bg-[var(--background-dark2)]" : "")}
                >
                    {icon}
                </button>
            </DescriptionOnHover>
        )
    }

    function setSortedBy(v: string) {
        updateSearchParam("s", v)
    }

    const searchBar = <MainSearchBar
        autoFocus={false}
        allowCloseWithNoText={true}
        kind={"topics"}
        placeholder={"Buscar"}
    />

    return <div
        className={cn("h-full flex w-full justify-between items-center space-x-1")}
    >
        <div className={"flex flex-1 " + (isMobile ? "space-x-1" : "space-x-2")}>
            <SelectionComponent<TopicsViewOption>
                onSelection={(s: TopicsViewOption) => {
                    router.push("/temas?view=" + s + (c ? "&c=" + c : ""));
                    setSearchState({value: "", searching: false})
                }}
                options={["lista", "mapa"]}
                selected={currentView}
                optionsNodes={optionsNodes}
                className={"flex " + (isMobile ? "space-x-1" : "space-x-2")}
            />
            <TopicsSortSelector
                sortedBy={sortedBy}
                setSortedBy={setSortedBy}
                disabled={currentView == "mapa"}
            />
        </div>

        <div
            className={"flex items-center w-64"}
        >
            {searchBar}
        </div>

        <div className={"py-1 flex-1 flex justify-end"}>
            <BaseButton
                startIcon={<PlusIcon/>}
                className={"py-2 px-1"}
                size={"small"}
                onClick={() => {
                    setNewTopicOpen(true)
                }}
                id={"new-topic-button"}
            >
                <span className={"hidden min-[600px]:block"}>Tema</span>
                <span className={"block min-[600px]:hidden"}>Tema</span>
            </BaseButton>
        </div>

        {newTopicOpen && <CreateTopicModal
            open={newTopicOpen}
            onClose={() => setNewTopicOpen(false)}
        />}
    </div>
}