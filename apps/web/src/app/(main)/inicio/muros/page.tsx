"use client"
import SelectionComponent from "@/components/buscar/search-selection-component";
import {useState} from "react";
import {feedOptionNodes} from "@/components/feed/config/feed-option-nodes";
import {TopicFeeds} from "@/components/feeds/topic-feeds";
import {CustomFeeds} from "@/components/feeds/custom-feeds";
import {BasicFeeds} from "@/components/feeds/basic-feeds";
import {FeedReorder} from "@/components/feeds/feed-reorder";
import {useSession} from "@/components/auth/use-session";


export default function Page() {
    const [selected, setSelected] = useState("Básicos")
    const {user} = useSession()

    return <div className={"pb-16"}>
        {user && <>
            <h2 className={"p-4 text-base font-bold border-b"}>
            Muros anclados
            </h2>
            <FeedReorder/>
        </>}
        <h2 className={"p-4 text-base font-bold border-b"}>
            Explorar muros
        </h2>
        <SelectionComponent
            onSelection={setSelected}
            selected={selected}
            options={["Básicos", "Temas", "Creados por la comunidad"]}
            optionsNodes={feedOptionNodes(40)}
            className={"flex border-b border-[var(--accent-dark)] max-w-screen overflow-x-auto no-scrollbar"}
            optionContainerClassName={"flex"}
        />
        {selected == "Básicos" && <BasicFeeds/>}
        {selected == "Temas" && <TopicFeeds/>}
        {selected == "Creados por la comunidad" && <CustomFeeds/>}
    </div>
}