"use client"
import {CategorySelector} from "./category-selector";
import {CategoryArticles} from "./category-articles";
import {useState} from "react";
import {useSearchParams} from "next/navigation";
import {IconButton} from "@mui/material";
import SwapVertIcon from '@mui/icons-material/SwapVert';
import {ModalBelow} from "../modal-below";
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
            <div className={"p-1 space-y-1 "}>
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
    const c = searchParams.get("c")
    const [categories, setCategories] = useState(c ? [c] : [])
    const [sortedBy, setSortedBy] = useState<TopicsSortOrder>("Populares")

    return <div>
        <div className={"w-full flex justify-between py-3 px-2"}>
            <div>
                <CategorySelector categories={categories} setCategories={setCategories}/>
            </div>
            <TopicsSortSelector sortedBy={sortedBy} setSortedBy={setSortedBy}/>
        </div>
        <CategoryArticles sortedBy={sortedBy} categories={categories}/>
    </div>
}