"use client"
import { compressContent, compressContents, decompressContent, decompressContents } from "../../actions/contents";
import { revalidateContents, revalidateEntities, revalidateUsers } from "../../actions/entities";
import { NotFoundPage } from "../../components/not-found-page";
import { ThreeColumnsLayout } from "../../components/three-columns";
import { useUser } from "../hooks/user";


export default function Page(){
    const {user} = useUser()

    if(!user || user.editorStatus != "Administrator"){
        return <NotFoundPage/>
    }

    const center = <div className="text-center">
        <h3 className="py-8">Revalidar</h3>

        <div className="flex justify-center">
        <div className="space-y-2 flex flex-col w-32">
        <button className="gray-btn" onClick={async () => {await revalidateEntities()}}>
            Artículos
        </button>
        <button className="gray-btn" onClick={async () => {await revalidateContents()}}>
            Contenidos
        </button>
        <button className="gray-btn" onClick={async () => {await revalidateUsers()}}>
            Usuarios
        </button>
        <button className="gray-btn" onClick={async () => {await compressContents()}}>
            Comprimir
        </button>
        <button className="gray-btn" onClick={async () => {await compressContent("cm1wa7d6c000o8wntc23olh1g")}}>
            Comprimir uno
        </button>
        <button className="gray-btn" onClick={async () => {await decompressContents()}}>
            Descomprimir contenidos
        </button>
        <button className="gray-btn" onClick={async () => {await decompressContent("cm20q7zys0003w80jqk227mw2")}}>
            Descomprimir contenido
        </button>
        </div>
        </div>
    </div>

    return <ThreeColumnsLayout center={center}/>
}