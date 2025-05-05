"use client"
import SelectionComponent from "@/components/buscar/search-selection-component";
import {Button} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import React, {ReactNode, useState} from "react";
import {CreateTopicModal} from "@/components/topics/topic/create-topic-modal";
import { PiGraph } from "react-icons/pi";
import { PiGraphBold } from "react-icons/pi";
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import { HiSquares2X2 } from "react-icons/hi2";
import { PiListBullets } from "react-icons/pi";
import { PiListBulletsBold } from "react-icons/pi";
import SearchBar from "@/components/buscar/search-bar";
import {useRouter, useSearchParams} from "next/navigation";
import {useSearch} from "@/components/buscar/search-context";



export const TopicsPageHeader = () => {
    const [newTopicOpen, setNewTopicOpen] = useState(false)
    const searchParams = useSearchParams()
    const router = useRouter()
    const c = searchParams.get("c")
    const view = searchParams.get("view")
    const {setSearchState} = useSearch()

    function optionsNodes(o: string, isSelected: boolean){
        let icon: ReactNode
        if(o == "mapa"){
            icon = isSelected ? <PiGraphBold fontSize={"22px"}/> : <PiGraph fontSize={"22px"}/>
        } else if(o == "lista"){
            icon = isSelected ? <PiListBulletsBold fontSize={"22px"}/> : <PiListBullets fontSize={"22px"}/>
        } else if(o == "listas"){
            icon = isSelected ? <HiSquares2X2 fontSize={"22px"}/> : <HiOutlineSquares2X2 fontSize={"22px"}/>
        }
        return <button className={"flex items-center p-1 hover:bg-[var(--background-dark)] rounded " + (isSelected ? "bg-[var(--background-dark2)]" : "")}>
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
            <SearchBar
                autoFocus={false}
                paddingY={"5px"}
            />
        </div>


        <div className={"py-1"}>
            <Button
                color="primary"
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
        <CreateTopicModal open={newTopicOpen} onClose={() => setNewTopicOpen(false)}/>
    </div>
}