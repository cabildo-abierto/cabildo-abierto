import {useRouter, useSearchParams} from "next/navigation";
import {ReactNode, useState} from "react";
import {useSearch} from "@/components/buscar/search-context";
import {Button} from "../../../modules/ui-utils/src/button";

import SelectionComponent from "@/components/buscar/search-selection-component";
import {Graph, ListBullets} from "@phosphor-icons/react"

import dynamic from "next/dynamic";
import MainSearchBar from "@/components/buscar/main-search-bar";
import AddIcon from "@mui/icons-material/Add";

const CreateTopicModal = dynamic(() => import("@/components/topics/topic/create-topic-modal"))

export const TopicsPageHeader = () => {
    const [newTopicOpen, setNewTopicOpen] = useState(false)
    const searchParams = useSearchParams()
    const router = useRouter()
    const c = searchParams.get("c")
    const view = searchParams.get("view")
    const {setSearchState} = useSearch()

    function optionsNodes(o: string, isSelected: boolean) {
        let icon: ReactNode
        icon = null
        if (o == "mapa") {
            icon = isSelected ? <Graph fontSize={"22px"} weight={"bold"}/> : <Graph fontSize={"22px"}/>
        } else if (o == "lista") {
            icon = isSelected ? <ListBullets fontSize={"22px"} weight={"bold"}/> : <ListBullets fontSize={"22px"}/>
        }
        return <button
            className={"flex items-center p-1 hover:bg-[var(--background-dark)] rounded " + (isSelected ? "bg-[var(--background-dark2)]" : "")}>
            {icon}
        </button>
    }

    return <div className="flex justify-between px-2 items-center space-x-1">
        <SelectionComponent
            onSelection={(s: string) => {
                router.push("/temas?view=" + s + (c ? "&c=" + c : ""));
                setSearchState({value: "", searching: false})
            }}
            options={["mapa", "lista"]}
            selected={view ? view : "mapa"}
            optionsNodes={optionsNodes}
            className="flex space-x-2"
        />

        <div className={"flex w-64 py-1"}>
            <MainSearchBar
                autoFocus={false}
                paddingY={"5px"}
            />
        </div>

        <div className={"py-1"}>
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
        </div>

        {newTopicOpen && <CreateTopicModal open={newTopicOpen} onClose={() => setNewTopicOpen(false)}/>}
    </div>
}