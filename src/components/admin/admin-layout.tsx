"use client"


import {ReactNode} from "react";
import SelectionComponent from "@/components/buscar/search-selection-component";
import {Button} from "@mui/material";
import {useRouter, useSearchParams} from "next/navigation";
import {NotFoundPage} from "../../../modules/ui-utils/src/not-found-page";
import {useSession} from "@/hooks/swr";

export const AdminLayout = ({children}: {children: ReactNode}) => {
    const router = useRouter()
    const params = useSearchParams()
    const {user} = useSession()

    function optionsNodes(o: string, isSelected: boolean){
        return <div className="text-[var(--text)] w-32 h-10">
            <Button
                onClick={() => {}}
                variant="text"
                color="inherit"
                fullWidth={true}
                disableElevation={true}
                sx={{textTransform: "none",
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

    function onSelection(option: string){
        router.push("/admin?s="+option)
    }

    if(!user || !user.platformAdmin){
        return <NotFoundPage/>
    }

    return <div>
        <div className={"flex items-center"}>
            <SelectionComponent
                onSelection={onSelection}
                selected={params.get("s") ? params.get("s") : "Principal"}
                options={["Principal", "Acceso", "Cache", "Sync"]}
                optionsNodes={optionsNodes}
                className={"flex items-center"}
            />
        </div>
        {children}
    </div>
}