import {AdminPrincipal} from "../../components/admin/principal";
import {NotFoundPage} from "../../components/ui-utils/not-found-page";
import {AdminAcceso} from "../../components/admin/acceso";
import {AdminCache} from "../../components/admin/cache";
import {AdminSync} from "../../components/admin/sync";


export default async function Page({searchParams}: {searchParams: Promise<{s: string}>}) {
    let {s} = await searchParams;


    if(!s || s == "Principal"){
        return <AdminPrincipal/>
    } else if(s == "Cache"){
        return <AdminCache/>
    } else if(s == "Acceso"){
        return <AdminAcceso/>
    } else if(s == "Sync"){
        return <AdminSync/>
    } else {
        return <NotFoundPage/>
    }
}