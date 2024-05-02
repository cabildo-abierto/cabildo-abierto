'use client'

import { useRouter } from 'next/navigation'
import {useSession} from "next-auth/react";

const HeaderButton = ({content, href}) => {
    const router = useRouter();

    return <h1 className="text-2xl font-semibold cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 hover:text-yellow-400 tracking-wide text-blue-400"
        onClick={() => router.push(href)}>{content}</h1>
}

const HeaderText = ({content}) => {
    return <h1 className="text-2xl font-semibold">{content}</h1>
}

const Header = () => {
    const router = useRouter();
    const { data: session, status } = useSession()

    const loggedIn = status === 'authenticated'
    const userName = session?.user?.name

    return (
        <header className="bg-gray-800 text-white py-4">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-semibold cursor-pointer" onClick={() => router.push("/")}>Demos</h1>
                {loggedIn && <HeaderText content={userName}/>}
                {!loggedIn && <HeaderButton content={"Iniciar sesión"} href={"/login"}/>}
                {!loggedIn && <HeaderButton content={"Registrarse"} href={"/signup"}/>}
            </div>
        </header>
    );
};

export default Header;