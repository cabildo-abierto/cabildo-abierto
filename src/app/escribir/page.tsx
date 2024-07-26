import React from "react";
import { ThreeColumnsLayout } from "@/components/main-layout";
import Link from "next/link";
import BoltIcon from '@mui/icons-material/Bolt';
import ArticleIcon from '@mui/icons-material/Article';


const Escribir = () => {
    const center = <div className="flex flex-col items-center h-screen">
        <div className="flex justify-center py-64">
            <div className="px-4">
                <Link href="/escribir/rapida">
                    <button className="large-btn scale-btn">
                        <BoltIcon/> Publicación rápida
                    </button>
                </Link>
            </div>
            <div className="px-4">
                <Link href="/escribir/publicacion">
                    <button className="large-btn scale-btn">
                        <ArticleIcon/> Publicación
                    </button>
                </Link>
            </div>
        </div>
    </div>

    return <ThreeColumnsLayout center={center}/>
};

export default Escribir

