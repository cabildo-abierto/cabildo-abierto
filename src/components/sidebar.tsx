import React from "react";
import { SidebarButton } from "./sidebar-button";
import Link from "next/link";
import { logout } from "@/actions/auth";
import HomeIcon from '@mui/icons-material/Home';
import CreateIcon from '@mui/icons-material/Create';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonIcon from '@mui/icons-material/Person';
import InfoIcon from '@mui/icons-material/Info';


export default function Sidebar({onClose, user}: any) {
    const onLogout = async (e: any) => {
        await logout()
    }

    return <div className ="h-screen w-screen fixed top-0 left-0">
        <div className="flex">
            <div className="h-screen lg:w-72 w-128 flex flex-col justify-between bg-white border-r z-10">
                <ul className="flex-1 mt-4 px-2">
                    <SidebarButton onClick={onClose} icon={<HomeIcon/>} text="Inicio" href="/inicio"/>
                    <SidebarButton icon={<LocalLibraryIcon/>} text="Wiki" href="/wiki"/>
                    <SidebarButton onClick={onClose} icon={<CreateIcon/>} text="Escribir" href="/escribir"/>
                    <SidebarButton icon={<PaymentIcon/>} onClick={onClose} text="Suscripciones" href="/suscripciones"/>
                    {user && <SidebarButton icon={<PersonIcon/>} onClick={onClose} text="Perfil" href={"/perfil/"+user.id.slice(1)}/>}
                    <SidebarButton icon={<InfoIcon/>} onClick={onClose} text="Cabildo Abierto" href="/wiki/Cabildo_Abierto"/>
                </ul>
                {user && <div className="flex flex-col items-center">
                    <Link href={`/perfil/${user?.id.slice(1)}`}
                        className="py-2 cursor-pointer rounded px-3 hover:bg-[var(--secondary-light)]">
                        {user?.name}
                    </Link>

                    <div className="py-4">
                        <button
                            className="gray-btn"
                            onClick={onLogout}
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </div>
                }
            </div>
            <button
                className="h-screen w-full"
                onClick={onClose}
            >
            </button>
            
        </div>
    </div>
}