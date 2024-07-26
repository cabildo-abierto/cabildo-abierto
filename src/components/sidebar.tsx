"use client"
import React from "react";
import EntityPopup from "@/components/entity-popup";
import { SidebarButton } from "./sidebar-button";
import { useUser } from "./user-provider";
import { validSubscription } from "./utils";
import Link from "next/link";
import { logout } from "@/actions/auth";
import { useRouter } from "next/navigation";
import HomeIcon from '@mui/icons-material/Home';
import CreateIcon from '@mui/icons-material/Create';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonIcon from '@mui/icons-material/Person';
import Image from "next/image"
import InfoIcon from '@mui/icons-material/Info';
import HelpIcon from '@mui/icons-material/Help';

const CabildoAbiertoIcon: React.FC = () => {
    return <Image
        src="/favicon.ico"
        alt="Cabildo Abierto"
        width={16}
        height={16}
    />
}

export default function Sidebar({onClose}: any) {
    const {user, setUser} = useUser()
    const router = useRouter()

    const onLogout = async (e: any) => {
        await logout()
        router.push("/");
        setTimeout(() => {setUser(null)}, 500)
    }

    return <div className ="h-screen w-screen fixed top-0 left-0">
        <div className="flex">
            <div className="h-screen w-64 flex flex-col justify-between bg-white border-r z-10">
                <ul className="flex-1 mt-4 px-2">
                    <SidebarButton onClick={onClose} icon={<HomeIcon/>} text="Inicio" href="/inicio"/>
                    <SidebarButton onClick={onClose} icon={<CreateIcon/>} text="Escribir" href="/escribir"/>
                    <SidebarButton icon={<LocalLibraryIcon/>} text="Wiki" href="/wiki"/>
                    <SidebarButton icon={<PaymentIcon/>} onClick={onClose} text="Suscripciones" href="/suscripciones"/>
                    {user && <SidebarButton icon={<PersonIcon/>} onClick={onClose} text="Perfil" href={"/perfil/"+user.id.slice(1)}/>}
                    <SidebarButton icon={<InfoIcon/>} onClick={onClose} text="Cabildo Abierto" href="/wiki/Cabildo_Abierto"/>
                </ul>
                {user && <div className="flex flex-col items-center">
                    <Link href={`/perfil/${user?.id.slice(1)}`}
                        className="py-2 inline-block cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 tracking-wide">
                        {user?.name}
                    </Link>

                    <div className="py-4">
                        <button
                            className="gray-button"
                            onClick={onLogout}
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </div>
                }
            </div>
            <button
                className="h-screen w-full bg-gray-600 bg-opacity-50 z-10"
                onClick={onClose}
            >
            </button>
            
        </div>
    </div>
}