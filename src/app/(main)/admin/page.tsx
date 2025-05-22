"use client"
import {AdminPrincipal} from "@/components/admin/principal";
import {NotFoundPage} from "../../../../modules/ui-utils/src/not-found-page";
import {AdminAcceso} from "@/components/admin/acceso";
import {AdminCache} from "@/components/admin/cache";
import {AdminSync} from "@/components/admin/sync";
import {useSearchParams} from "next/navigation";
import {AdminPDS} from "@/components/admin/admin-pds";


export default function Page() {
    const s = useSearchParams().get("s")

    if(!s || s == "Principal"){
        return <AdminPrincipal/>
    } else if(s == "Cache"){
        return <AdminCache/>
    } else if(s == "Acceso"){
        return <AdminAcceso/>
    } else if(s == "Sync"){
        return <AdminSync/>
    } else if(s == "PDS"){
        return <AdminPDS/>
    } else {
        return <NotFoundPage/>
    }
}