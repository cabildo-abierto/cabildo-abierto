"use client"
import {CategorySelector} from "./category-selector";
import {CategoryArticles} from "./category-articles";
import {useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {IconButton} from "@mui/material";
import SwapVertIcon from '@mui/icons-material/SwapVert';
import {ModalBelow} from "../ui-utils/modal-below";
import { BasicButton } from "../ui-utils/basic-button";

export type TopicsSortOrder = "Populares" | "Ediciones recientes"


export const TopicsSortSelector = ({sortedBy, setSortedBy}: {
    sortedBy: TopicsSortOrder
    setSortedBy: (s: TopicsSortOrder) => void
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null)

    return <div style={{ position: 'relative', display: 'inline-block' }}>
        <div className={"text-[var(--text-light)]"}>
            <IconButton
                size={"small"}
                onClick={(e) => {e.preventDefault(); e.stopPropagation(); setAnchorEl(e.target); setIsDropdownOpen(prev => !prev)}}
            >
                <SwapVertIcon fontSize={"small"}/>
            </IconButton>
        </div>

        <ModalBelow
            anchorEl={anchorEl}
            open={isDropdownOpen}
            onClose={() => {setIsDropdownOpen(false)}}
        >
            <div className={"p-1 space-y-1"}>
                {["Populares", "Ediciones recientes"].map((s: TopicsSortOrder, index) => {
                    return <div key={index}>
                        <BasicButton
                            onClick={() => {setSortedBy(s); setIsDropdownOpen(false)}}
                            color={"inherit"}
                            fullWidth={true}
                            size={"small"}
                        >
                            <span className={s == sortedBy ? "font-bold" : ""}>{s}</span>
                        </BasicButton>
                    </div>
                })}
            </div>
        </ModalBelow>
    </div>
}


export const TopicsListView = () => {
    const searchParams = useSearchParams()
    const categories = searchParams.getAll("c")
    const [sortedBy, setSortedBy] = useState<TopicsSortOrder>("Populares")
    const router = useRouter()

    function setCategories(newCats: string[]){
        router.push("/temas?view=lista&c=" + newCats.join("&c="))
    }

    return <div>
        <div className={"w-full flex justify-between pt-1 pb-2"}>
            <div className={"pt-1"}>
                <CategorySelector categories={categories} setCategories={setCategories}/>
            </div>
            <TopicsSortSelector sortedBy={sortedBy} setSortedBy={setSortedBy}/>
        </div>
        <div className={"flex justify-center"}>
            <div className={"w-full"}>
                <CategoryArticles sortedBy={sortedBy} categories={categories}/>
            </div>
        </div>
    </div>
}