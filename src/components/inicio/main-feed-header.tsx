"use client"
import {Button, IconButton} from "@mui/material"
import SelectionComponent from "../search/search-selection-component"
import MenuIcon from '@mui/icons-material/Menu';
import {CabildoIcon} from "../icons/home-icon";
import {Logo} from "../ui-utils/logo";
import {emptyChar} from "../utils/utils";
import {useLayoutConfig} from "../layout/layout-config-context";
import {MobileHeader} from "../layout/mobile-header";


export const MainFeedHeader = ({
   selected, onSelection
}: {
    selected: string
    onSelection: (v: string) => void
}) => {
    const {layoutConfig, setLayoutConfig} = useLayoutConfig()

    function optionsNodes(o: string, isSelected: boolean){
        return <div className="text-[var(--text)] w-32 h-10">
            <Button
                onClick={() => {}}
                variant="text"
                color="inherit"
                fullWidth={true}
                disableElevation={true}
                sx={{
                    textTransform: "none",
                    paddingY: 0,
                    borderRadius: 0
                }}
            >
                <div className={"pb-1 pt-2 border-b-[4px] " + (isSelected ? "border-[var(--primary)] font-semibold border-b-[4px]" : "border-transparent")}>
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
                options={["En discusión", "Siguiendo"]}
                selected={selected}
                optionsNodes={optionsNodes}
                className="flex"
            />
        </div>
    </div>
}