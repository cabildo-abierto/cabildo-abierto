"use client"
import {AdminPrincipal} from "@/components/admin/principal";
import {NotFoundPage} from "@/components/utils/not-found-page";
import {AdminAcceso} from "@/components/admin/acceso";
import {AdminCache} from "@/components/admin/cache";
import {AdminSync} from "@/components/admin/sync";
import {useSearchParams} from "next/navigation";
import {AdminPDS} from "@/components/admin/admin-pds";
import {AdminValidation} from "@/components/admin/admin-validation";
import {AdminRemuneraciones} from "@/components/admin/admin-remuneraciones";
import {AdminStats} from "@/components/admin/stats";
import {AdminWiki} from "@/components/admin/admin-wiki";


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
    } else if(s == "PDS") {
        return <AdminPDS/>
    } else if(s == "Validacion") {
        return <AdminValidation/>
    } else if(s == "Remuneraciones") {
        return <AdminRemuneraciones/>
    } else if(s == "Stats") {
        return <AdminStats/>
    } else if(s == "Wiki") {
        return <AdminWiki/>
    } else {
        return <NotFoundPage/>
    }
}