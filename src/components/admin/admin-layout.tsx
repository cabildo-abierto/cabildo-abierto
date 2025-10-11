"use client"
import {ReactNode} from "react";
import SelectionComponent from "@/components/buscar/search-selection-component";
import {useRouter, useSearchParams} from "next/navigation";
import {NotFoundPage} from "../layout/utils/not-found-page";
import {useSession} from "@/queries/getters/useSession";
import {configOptionNodes} from "@/components/config/config-option-nodes";


export const AdminLayout = ({children}: {children: ReactNode}) => {
    const router = useRouter()
    const params = useSearchParams()
    const {user} = useSession()

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
                options={["Principal", "Acceso", "Sync", "Validacion", "Remuneraciones", "Stats", "Wiki"]}
                optionsNodes={configOptionNodes}
                className={"flex space-x-2"}
                optionContainerClassName={""}
            />
        </div>
        {children}
    </div>
}