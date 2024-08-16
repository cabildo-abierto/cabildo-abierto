import React from "react";
import { ThreeColumnsLayout } from "@/components/main-layout";
import Link from "next/link";
import BoltIcon from '@mui/icons-material/Bolt';
import ArticleIcon from '@mui/icons-material/Article';
import EntityPopup from "@/components/entity-popup";
import { getUser } from "@/actions/get-user";


const Escribir = async () => {
    const className = "gray-btn w-64 flex justify-center items-center"
    const user = await getUser()

    const center = <div className="flex flex-col items-center h-screen">
        <div className="lg:flex lg:justify-center py-64">
            <div className="p-4">
                <Link href="/escribir/rapida">
                    <button className={className}>
                    <span className="px-1"><BoltIcon/></span> Publicación rápida
                    </button>
                </Link>
            </div>
            <div className="p-4">
                <Link href="/escribir/publicacion">
                    <button className={className}>
                        <span className="px-1"><ArticleIcon/></span> Publicación
                    </button>
                </Link>
            </div>
            <div className="p-4">
                <EntityPopup user={user}/>
            </div>
        </div>
    </div>

    return <ThreeColumnsLayout center={center}/>
};

export default Escribir

