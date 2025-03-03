"use client"
import SelectionComponent from "../search/search-selection-component";
import {Button} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import React, {ReactNode, useState} from "react";
import {CreateTopicModal} from "../topic/create-topic-modal";
import { PiGraph } from "react-icons/pi";
import { PiGraphBold } from "react-icons/pi";
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import { HiSquares2X2 } from "react-icons/hi2";
import { PiListBullets } from "react-icons/pi";
import { PiListBulletsBold } from "react-icons/pi";
import SearchBar from "../search/searchbar";
import {useRouter, useSearchParams} from "next/navigation";



export const TopicsPageHeader = () => {
    const [newTopicOpen, setNewTopicOpen] = useState(false)
    const searchParams = useSearchParams()
    const router = useRouter()
    const c = searchParams.get("c")
    const view = searchParams.get("view")

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

    return <div className="flex justify-between border-b pr-2 items-center">
        <SelectionComponent
            onSelection={(s: string) => {router.push("/temas?view="+s+(c ? "&c="+c : ""))}}
            options={["mapa", "listas", "lista"]}
            selected={view ? view : "mapa"}
            optionsNodes={optionsNodes}
            className="flex space-x-2"
        />

        <div className={"flex w-64 h-8"}>
            <SearchBar
                className={""}
                autoFocus={false}
            />
        </div>

        <div className={"py-1"}>
            <Button
                color="primary"
                variant="text"
                disableElevation={true}
                startIcon={<AddIcon/>}
                size={"small"}
                sx={{textTransform: "none", height: "32px"}}
                onClick={() => {
                    setNewTopicOpen(true)
                }}
            >
                Nuevo tema
            </Button>
        </div>
        <CreateTopicModal open={newTopicOpen} onClose={() => setNewTopicOpen(false)} />
    </div>
}