'use client'

import { useRouter } from 'next/navigation'
import {useSession} from "next-auth/react";
import { logout } from "@/actions/auth";


const HeaderText = ({content}) => {
    return <h1 className="text-2xl font-semibold">{content ? content : "..."}</h1>
}

const SignOutButton = () => {
    return <form action={logout}>
        <button className="text-2xl font-semibold cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 hover:text-yellow-400 tracking-wide text-blue-400">
            Cerrar sesión
        </button>
    </form>
}

const SessionElements = ({userName}) => {
    return <div className="flex">
        <div className="mr-4"> {/* Adjust margin-right to create space */}
            <HeaderText content={userName}/>
        </div>
        <div>
            <SignOutButton/>
        </div>
    </div>
}

const Header = () => {
    const router = useRouter();
    const { data: session, status } = useSession()

    const userName = session?.user?.name

    return (
        <header className="bg-gray-800 text-white py-4 flex justify-between">
            <div className="flex px-4">
                <h1 className="text-2xl font-semibold cursor-pointer" onClick={() => router.push("/")}>Demos</h1>
            </div>
            <div className="flex">
                <SessionElements userName={userName}/>
            </div>
        </header>
    );
};

export default Header;