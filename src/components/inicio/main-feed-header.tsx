"use client"
import {Button, IconButton} from "@mui/material"
import SelectionComponent from "@/components/buscar/search-selection-component"
import MenuIcon from '@mui/icons-material/Menu';
import {CabildoIcon} from "../icons/home-icon";
import {Logo} from "../../../modules/ui-utils/src/logo";
import {emptyChar} from "../../utils/utils";
import {useLayoutConfig} from "../layout/layout-config-context";
import {MobileHeader} from "../layout/mobile-header";


export const MainFeedHeader = ({
   selected, onSelection
}: {
    selected: string
    onSelection: (v: string) => void
}) => {

    function optionsNodes(o: string, isSelected: boolean){
        return <div className="text-[var(--text)] h-10">
            <Button
                onClick={() => {}}
                variant="text"
                color="inherit"
                fullWidth={true}
                disableElevation={true}
                sx={{
                    textTransform: "none",
                    paddingY: 0,
                    borderRadius: 0,
                }}
            >
                <div className={"whitespace-nowrap min-[500px]:mx-4 pb-1 pt-2 font-semibold border-b-[4px] " + (isSelected ? "border-[var(--primary)] text-[var(--text)] border-b-[4px]" : "border-transparent text-[var(--text-light)]")}>
                    {o}
                </div>
            </Button>
        </div>
    }

    return <div className="flex flex-col border-b">
        <MobileHeader/>
        <div className={"flex"}>
            <SelectionComponent
                onSelection={onSelection}
                options={["Siguiendo", "En discusión", "Descubrir"]}
                selected={selected}
                optionsNodes={optionsNodes}
                className="flex"
            />
        </div>
    </div>
}