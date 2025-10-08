"use client"

import React, {useState} from "react";
import SelectionComponent from "@/components/buscar/search-selection-component";
import {useSession} from "@/queries/getters/useSession";
import {feedOptionNodes} from "@/components/config/feed-option-nodes";
import {AccountSettings} from "@/components/config/account-settings";
import {AppearanceSettings} from "@/components/config/appearance-settings";
import {FeedDefaultsSettings} from "@/components/config/feed-defaults-settings";


const Ajustes = () => {
    const {user} = useSession()
    const [selected, setSelected] = useState("Cuenta")

    if (!user) {
        return <></>
    }

    return (
        <div className="">
            <div className={"border-b border-[var(--accent-dark)] flex"}>
                <SelectionComponent
                    selected={selected}
                    onSelection={(v) => {
                        setSelected(v)
                    }}
                    options={["Cuenta", "Apariencia", "Algoritmos"]}
                    optionsNodes={feedOptionNodes(40)}
                    className="flex h-full"
                />
            </div>
            <div className="py-4 px-8">
                {selected == "Cuenta" && <AccountSettings/>}
                {selected == "Apariencia" && <AppearanceSettings/>}
                {selected == "Algoritmos" && <FeedDefaultsSettings/>}
            </div>
        </div>
    )
};

export default Ajustes;
