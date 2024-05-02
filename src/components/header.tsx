'use client'

import { useRouter } from 'next/navigation'
import {useSession} from "next-auth/react";
import { logout } from "@/actions/auth";


const HeaderText = ({content}) => {
    return <h1 className="text-lg">{content ? content : "..."}</h1>
}

const SignOutButton = () => {
    return <form action={logout}>
        <button className="cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 tracking-wide text-gray-400">
            Cerrar sesión
        </button>
    </form>
}

const SessionElements = ({userName}) => {
    return <div className="">
        <div className="mr-4">
            <HeaderText content={userName}/>
        </div>
        <div className="text-center">
            <SignOutButton/>
        </div>
    </div>
}

const Header = () => {
    const router = useRouter();
    const { data: session, status } = useSession()

    const userName = session?.user?.name

    return (
        <header className="bg-gray-50 border flex justify-between">
            <div className="flex px-2 py-2">
                <h1 className="text-3xl font-bold text-gray-900" onClick={() => router.push("/feed")}>Demos</h1>
            </div>
            <div className="flex">
                <SessionElements userName={userName}/>
            </div>
        </header>
    );
};

export default Header;