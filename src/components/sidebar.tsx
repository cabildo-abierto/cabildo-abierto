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
import {CabildoIcon, DashboardIcon, ManageAccountIcon, NotificationsIcon, ScoreboardIcon, SupportIcon} from "./icons";
import { useRouter } from "next/navigation";
import { signOut } from "../actions/auth";
import { useChat, useSupportNotRespondedCount, useUser } from "../app/hooks/user";
import { ChatMessage } from "@prisma/client";
import { UserProps } from "../app/lib/definitions";
import LoadingSpinner from "./loading-spinner";


function unseenCount(chat: ChatMessage[], userId: string){
    let count = 0
    for(let i = chat.length-1; i >= 0; i--){
        if(chat[i].fromUserId == userId) break
        if(!chat[i].seen) count ++
        else break
    }
    return count
}


const SupportButton = ({user, onClose}: {user?: UserProps, onClose: () => void}) => {
    const chat = useChat(user.id, "soporte")
    const newSupportCount = chat.chat ? unseenCount(chat.chat, user.id) : 0
    return <SidebarButton icon={<SupportIcon newCount={newSupportCount}/>} onClick={onClose} text="Soporte" href="/soporte"/>
}


const HelpDeskButton = ({user, onClose}: {user?: UserProps, onClose: () => void}) => {
    const count = useSupportNotRespondedCount()

    if(count.isLoading){
        return <LoadingSpinner/>
    }

    return <SidebarButton icon={<SupportIcon newCount={count.count}/>} onClick={onClose} text="Responder" href="/soporte/responder"/>
}

export default function Sidebar({onClose}: {onClose: () => void}) {
    const user = useUser()
    const {mutate} = useSWRConfig()
    const router = useRouter()
    
    if(!user.user) return <></>

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
                    <SidebarButton onClick={onClose} icon={<NotificationsIcon count={user.user ? user.user._count.notifications : undefined}/>} text="Notificaciones" href="/notificaciones"/>
                    <SidebarButton icon={<PaymentIcon/>} onClick={onClose} text="Suscripciones" href="/suscripciones"/>
                    {user.user && <SidebarButton icon={<PersonIcon/>} onClick={onClose} text="Perfil" href={id2url(user.user.id)}/>}
                    <SidebarButton icon={<DashboardIcon/>} onClick={onClose} text="Panel personal" href="/panel"/>
                    <SidebarButton icon={<InfoIcon/>} onClick={onClose} text="Cabildo Abierto" href="/articulo/Cabildo_Abierto"/>
                    <SidebarButton icon={<ManageAccountIcon/>} onClick={onClose} text="Cuenta" href="/cuenta"/>
                    <SupportButton user={user.user} onClose={onClose}/>
                    {user.user.editorStatus == "Administrator" && 
                    <HelpDeskButton user={user.user} onClose={onClose}/>}
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