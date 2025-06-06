"use client"


import {ReactNode} from "react";
import SelectionComponent from "@/components/buscar/search-selection-component";
import {useRouter, useSearchParams} from "next/navigation";
import {NotFoundPage} from "../../../modules/ui-utils/src/not-found-page";
import {useSession} from "@/queries/api";
import { Button } from "../../../modules/ui-utils/src/button";

export const AdminLayout = ({children}: {children: ReactNode}) => {
    const router = useRouter()
    const params = useSearchParams()
    const {user} = useSession()

    function optionsNodes(o: string, isSelected: boolean){
        return <button
                onClick={() => {}}
                className={"rounded-lg px-2 " + (isSelected ? "bg-[var(--primary)]" : "")}
            >
                {o}
            </button>
    }

    function onSelection(option: string){
        router.push("/admin?s="+option)
    }

    if(!user || !user.platformAdmin){
        return <NotFoundPage/>
    }

    return <div className={"w-full"}>
        <div className={"w-full py-2"}>
            <SelectionComponent
                onSelection={onSelection}
                selected={params.get("s") ? params.get("s") : "Principal"}
                options={["Principal", "Acceso", "Cache", "Sync", "PDS", "Validacion"]}
                optionsNodes={optionsNodes}
                className={"flex"}
            />
        </div>
        {children}
    </div>
}