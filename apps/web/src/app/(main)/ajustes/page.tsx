"use client"

import React, {useState} from "react";
import SelectionComponent from "@/components/buscar/search-selection-component";
import {useSession} from "@/components/auth/use-session";
import {feedOptionNodes} from "@/components/feed/config/feed-option-nodes";
import {AccountSettings} from "@/components/feed/config/account-settings";
import {AppearanceSettings} from "@/components/feed/config/appearance-settings";
import {FeedDefaultsSettings} from "@/components/feed/config/feed-defaults-settings";
import {AtPermissionsPanel} from "@/components/mensajes/at-permissions-panel";


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
                    options={["Cuenta", "Apariencia", "Algoritmos", "Permisos"]}
                    optionsNodes={feedOptionNodes(40)}
                    className="flex h-full max-w-full overflow-x-auto custom-scrollbar"
                />
            </div>
            <div className="py-4 px-8">
                {selected == "Cuenta" && <AccountSettings/>}
                {selected == "Apariencia" && <AppearanceSettings/>}
                {selected == "Algoritmos" && <FeedDefaultsSettings/>}
                {selected == "Permisos" && (
                    <div className="max-w-lg pb-32">
                        <AtPermissionsPanel
                            loadWhen={selected === "Permisos"}
                        />
                    </div>
                )}
            </div>
        </div>
    )
};

export default Ajustes;
