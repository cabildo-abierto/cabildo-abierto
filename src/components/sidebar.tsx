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
import {CabildoIcon, DashboardIcon, ManageAccountIcon, SupportIcon} from "./icons";
import { useRouter } from "next/navigation";
import { signOut } from "../actions/auth";
import { useChat, useSupportNotRespondedCount, useUser } from "../app/hooks/user";
import { ChatMessage } from "@prisma/client";
import { UserProps } from "../app/lib/definitions";
import { articleUrl } from "./utils";


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

    return <SidebarButton icon={<SupportIcon newCount={count.count}/>} onClick={onClose} text="Responder" href="/soporte/responder"/>
}

const SidebarUsername = ({user, onLogout}: {user: UserProps, onLogout: () => Promise<{error?: string}>}) => {
    return <div className="flex flex-col items-center">
        <Link href={`/perfil/${user.id}`}
            className="mb-1 cursor-pointer rounded px-3 hover:bg-[var(--secondary-light)] text-center">
            {user.name}
        </Link>
        <div className="mb-2">
            <StateButton
                className="small-btn"
                handleClick={onLogout}
                text1="Cerrar sesión"
                text2="Cerrando sesión"
            />
        </div>
    </div>
}


const SidebarUsernameNoUser = () => {
    return <div className="flex flex-col items-center">
        <Link href="/" className="link3 text-center text-[var(--text-light)] px-1 text-sm mb-4">Creá una cuenta o iniciá sesión para acceder a todas las funcionalidades del sitio</Link>
    </div>
}


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
        return {}
    }

    return <div className ="h-screen w-screen fixed top-0 left-0 z-20">
        <div className="flex">
            <div className="h-screen lg:w-72 w-128 flex flex-col justify-between bg-[var(--topbar)] border-r text-gray-900 safe-padding-mobile">
                <div className="flex flex-col mt-4 px-2">
                    {user.user && <SidebarUsername
                        user={user.user}
                        onLogout={onLogout}
                    />}
                    {!user.isLoading && !user.user && <SidebarUsernameNoUser/>}
                    <SidebarButton onClick={onClose} icon={<CabildoIcon/>} text="Inicio" href="/inicio"/>
                    <SidebarButton onClick={onClose} icon={<EditNoteIcon/>} text="Borradores" href="/borradores"/>
                    <SidebarButton icon={<PaymentIcon/>} onClick={onClose} text="Suscripciones" href="/suscripciones"/>
                    {user.user && <SidebarButton icon={<PersonIcon/>} onClick={onClose} text="Perfil" href={id2url(user.user.id)}/>}
                    <SidebarButton icon={<DashboardIcon/>} onClick={onClose} text="Panel personal" href="/panel"/>
                    <SidebarButton icon={<InfoIcon/>} onClick={onClose} text="Cabildo Abierto" href={articleUrl("Cabildo_Abierto")}/>
                    <SidebarButton icon={<ManageAccountIcon/>} onClick={onClose} text="Cuenta" href="/cuenta"/>
                    {user.user && <SupportButton user={user.user} onClose={onClose}/>}
                    {user.user && user.user.editorStatus == "Administrator" && 
                    <HelpDeskButton user={user.user} onClose={onClose}/>}
                </div>
            </div>
            <button
                className="h-screen w-full"
                onClick={onClose}
            >
            </button>
        </div>
    </div>
}