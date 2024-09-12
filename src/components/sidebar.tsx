import React from "react";
import { SidebarButton } from "./sidebar-button";
import Link from "next/link";
import PaymentIcon from '@mui/icons-material/Payment';
import PersonIcon from '@mui/icons-material/Person';
import InfoIcon from '@mui/icons-material/Info';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { useSWRConfig } from "swr";
import StateButton from "./state-button";
import { id2url } from "./content";
import {CabildoIcon, DashboardIcon, ScoreboardIcon} from "./icons";
import { useRouter } from "next/navigation";
import { signOut } from "../actions/auth";
import { useUser } from "../app/hooks/user";


export default function Sidebar({onClose}: {onClose: () => void}) {
    const user = useUser()
    const {mutate} = useSWRConfig()
    const router = useRouter()
    
    const onLogout = async () => {
        const {error} = await signOut()
        if(!error){
            router.push("/")
            await mutate("/api/user", null)
        }
    }

    return <div className ="h-screen w-screen fixed top-0 left-0 z-20">
        <div className="flex">
            <div className="h-screen lg:w-72 w-128 flex flex-col justify-between bg-[var(--background)] border-r">
                <div className="flex flex-col mt-4 px-2">
                    <SidebarButton onClick={onClose} icon={<CabildoIcon/>} text="Inicio" href="/inicio"/>
                    <SidebarButton onClick={onClose} icon={<EditNoteIcon/>} text="Borradores" href="/borradores"/>
                    
                    <SidebarButton icon={<PaymentIcon/>} onClick={onClose} text="Suscripciones" href="/suscripciones"/>
                    {user.user && <SidebarButton icon={<PersonIcon/>} onClick={onClose} text="Perfil" href={id2url(user.user.id)}/>}
                    <SidebarButton icon={<DashboardIcon/>} onClick={onClose} text="Panel personal" href="/panel"/>
                    <SidebarButton icon={<ScoreboardIcon/>} onClick={onClose} text="Ranking" href="/ranking"/>

                    <SidebarButton icon={<InfoIcon/>} onClick={onClose} text="Cabildo Abierto" href="/articulo/Cabildo_Abierto"/>
                </div>
                {user.user && <div className="flex flex-col items-center">
                    <Link href={`/perfil/${user.user.id}`}
                        className="py-2 cursor-pointer rounded px-3 hover:bg-[var(--secondary-light)]">
                        {user.user.name}
                    </Link>

                    <div className="py-4">
                        <StateButton
                            className="gray-btn"
                            onClick={onLogout}
                            text1="Cerrar sesión"
                            text2="Cerrando sesión"
                        />
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