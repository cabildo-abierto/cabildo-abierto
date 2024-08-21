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
import { useUser } from "@/app/hooks/user";
import { Logo } from "./home-page";
import EditNoteIcon from '@mui/icons-material/EditNote';


export default function Sidebar({onClose}: {onClose: () => void}) {
    const user = useUser()
    
    const onLogout = async (e: any) => {
        await logout()
    }

    return <div className ="h-screen w-screen fixed top-0 left-0 z-20">
        <div className="flex">
            <div className="h-screen lg:w-72 w-128 flex flex-col justify-between bg-[var(--background)] border-r">
                <ul className="flex-1 mt-4 px-2">
                    <SidebarButton onClick={onClose} icon={<HomeIcon/>} text="Inicio" href="/inicio"/>
                    <SidebarButton onClick={onClose} icon={<CreateIcon/>} text="Escribir" href="/escribir"/>
                    <SidebarButton onClick={onClose} icon={<EditNoteIcon/>} text="Borradores" href="/borradores"/>
                    
                    <SidebarButton icon={<PaymentIcon/>} onClick={onClose} text="Suscripciones" href="/suscripciones"/>
                    {user.user && <SidebarButton icon={<PersonIcon/>} onClick={onClose} text="Perfil" href={"/perfil/"+user.user.id.slice(1)}/>}
                    <SidebarButton icon={<InfoIcon/>} onClick={onClose} text="Cabildo Abierto" href="/articulo/Cabildo_Abierto"/>
                </ul>
                {user.user && <div className="flex flex-col items-center">
                    <Link href={`/perfil/${user.user.id.slice(1)}`}
                        className="py-2 cursor-pointer rounded px-3 hover:bg-[var(--secondary-light)]">
                        {user.user.name}
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