import Image from "next/image";
import Link from "next/link";
import React from "react";
import {getUser} from "@/actions/get-user";
import {logout} from "@/actions/auth";


function FeedButton() {
    return <li className="mb-8 mt-4 text-l font-bold text-gray-900 px-1">
        <Link href={"/profile/cabildoabierto"} className="py-2 px-2 cursor-pointer hover:bg-gray-300 rounded-lg">
            Cabildo Abierto
        </Link>
    </li>
}


const SidebarButton: React.FC<{text: string, href: string}> = ({text, href}) => {
    return <Link href={href} className="text-semibold">
        <li className="mb-4 rounded-lg hover:bg-gray-200 transition duration-100 cursor-pointer px-2">
            <div className="px-1 py-2">
                {text}
            </div>
        </li>
    </Link>
}


async function Sidebar() {
    const user = await getUser()
    if(!user) return false

    const perfil_href: string = "/profile/" + user?.id

    return <div className="h-screen flex flex-col mr-4">
    <ul className="flex-1 mt-4">
        <FeedButton/>
        <SidebarButton text="Inicio" href="/feed"/>
        <SidebarButton text="Temas" href="/temas"/>
        <SidebarButton text="Escribir" href="/escribir"/>
        <SidebarButton text="Buscar" href="/buscar"/>
        <SidebarButton text="Wiki" href="/estado"/>
        <SidebarButton text="Crear entidad" href="/crear-entidad"/>
    </ul>
    <div className="mt-auto">
        <ul>
            <li className="mb-2">
                <Link href={`/profile/${user?.id}`}
                    className={`inline-block cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 tracking-wide text-lg px-1`}>
                    {user?.name}
                </Link>
            </li>
            <li className="mb-2">
                <form action={logout}>
                    <button
                        className="cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 tracking-wide text-gray-400 px-1">
                        Cerrar sesión
                    </button>
                </form>
            </li>
            </ul>
        </div>
    </div>
}


const FeedLayout: React.FC<{children: React.ReactNode}> = ({children}) => {
    const centerWidth = 800; // Width of the center feed
    const sidebarWidth = `calc((100% - ${centerWidth}px) / 2)`;

    return (
        <div className="flex justify-center">
            <div className="fixed left-0 top-0 h-screen" style={{ width: sidebarWidth }}>
                <div className="flex justify-end">
                    <Sidebar/>
                </div>
            </div>
            <div className="border-l border-r" id="center" style={{ width: `${centerWidth}px` }}>
                {children}
            </div>
            <div className="fixed top-0 right-0 h-screen" style={{ width: sidebarWidth }}>
            </div>
        </div>
    );
};

export default FeedLayout;