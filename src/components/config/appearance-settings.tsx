import {ThemeMode, useTheme} from "@/components/layout/theme/theme-context";
import SelectionComponent from "@/components/buscar/search-selection-component";
import React from "react";

export const AppearanceSettings = () => {
    const {mode, setMode} = useTheme();

    function onSelection(v: ThemeMode) {
        setMode(v)
    }

    function optionsNodes(o: ThemeMode, selected: boolean) {
        let className = "border text-base px-2 cursor-pointer " + (selected ? "border-2 border-[var(--text)]" : "")

        if (o == "light") {
            className += " bg-[#FFFFF0] text-[#1a1a1a]"
        } else if (o == "dark") {
            className += " bg-[#191923] text-[#eeeeee]"
        } else if (o == "system") {
            className += " bg-[var(--background-dark)]"
        }

        return <button
            className={className}
        >
            {o == "system" ? "Sistema" : o == "light" ? "Claro" : "Oscuro"}
        </button>
    }

    return <>
        <div className="mb-4 space-y-4">
            <div className={"uppercase text-[var(--text-light)] font-semibold"}>
                Tema
            </div>
            <SelectionComponent<ThemeMode>
                onSelection={onSelection}
                options={["system", "light", "dark"]}
                optionsNodes={optionsNodes}
                selected={mode}
                className={"flex space-x-2"}
                optionContainerClassName={"flex"}
            />
        </div>
    </>
}