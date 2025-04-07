"use client"
import {CategorySelector} from "./category-selector";
import {CategoryArticles} from "./category-articles";
import {useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {IconButton} from "@/../modules/ui-utils/src/icon-button"
import SwapVertIcon from '@mui/icons-material/SwapVert';
import {ModalOnClick} from "../../../modules/ui-utils/src/modal-on-click";
import {OptionsDropdownButton} from "@/components/feed/content-options/options-dropdown-button";

export type TopicsSortOrder = "Populares" | "Ediciones recientes"


export const TopicsSortSelector = ({sortedBy, setSortedBy}: {
    sortedBy: TopicsSortOrder
    setSortedBy: (s: TopicsSortOrder) => void
}) => {
    const [onClose, setOnClose] = useState<() => void>()

    const modal = (
        <div className={"p-1 space-y-1 border rounded"}>
            {["Populares", "Ediciones recientes"].map((s: TopicsSortOrder, index) => {
                return <div key={index}>
                    <OptionsDropdownButton
                        onClick={() => {
                            setSortedBy(s)
                            onClose()
                        }}
                        color={"inherit"}
                        fullWidth={true}
                        size={"small"}
                        text1={<span className={s == sortedBy ? "font-bold" : ""}>{s}</span>}
                    />
                </div>
            })}
        </div>
    )

    return <ModalOnClick modal={modal} setOnClose={setOnClose}>
        <div className={"text-[var(--text-light)]"}>
            <IconButton
                size={"small"}
                color={"inherit"}
            >
                <SwapVertIcon fontSize={"small"}/>
            </IconButton>
        </div>
    </ModalOnClick>

}


export const TopicsListView = () => {
    const searchParams = useSearchParams()
    const categories = searchParams.getAll("c")
    const [sortedBy, setSortedBy] = useState<TopicsSortOrder>("Populares")
    const router = useRouter()

    function setCategories(newCats: string[]) {
        router.push("/temas?view=lista&c=" + newCats.join("&c="))
    }

    return <div>
        <div className={"w-full flex justify-between items-center pt-1 pb-2 px-2"}>
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