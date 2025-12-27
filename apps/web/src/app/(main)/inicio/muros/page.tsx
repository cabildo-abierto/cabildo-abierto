"use client"
import SelectionComponent from "@/components/buscar/search-selection-component";
import {useState} from "react";
import {feedOptionNodes} from "@/components/feed/config/feed-option-nodes";
import {TopicFeeds} from "@/components/feeds/topic-feeds";
import {CustomFeeds} from "@/components/feeds/custom-feeds";
import {BasicFeeds} from "@/components/feeds/basic-feeds";


export default function Page() {
    const [selected, setSelected] = useState("Básicos")

    return <div className={"pb-16"}>
        <div>
            <SelectionComponent
                onSelection={setSelected}
                selected={selected}
                options={["Básicos", "Temas", "Creados por la comunidad"]}
                optionsNodes={feedOptionNodes(40)}
                className={"flex border-b border-[var(--accent-dark)] max-w-screen overflow-x-auto no-scrollbar"}
                optionContainerClassName={"flex"}
            />
        </div>
        {selected == "Básicos" && <BasicFeeds/>}
        {selected == "Temas" && <TopicFeeds/>}
        {selected == "Creados por la comunidad" && <CustomFeeds/>}
    </div>
}