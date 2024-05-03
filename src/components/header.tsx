'use client'

import { useRouter } from 'next/navigation'
import {useSession} from "next-auth/react";
import { logout } from "@/actions/auth";

import Link from 'next/link';

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

const Header = ({enableNewDiscussion}) => {
    const router = useRouter();
    const { data: session, status } = useSession()

    const userName = session?.user?.name

    return (
        <header className="bg-gray-50 border flex justify-between">
            <div className="flex px-2 py-2">
                <h1 className="text-3xl font-bold text-gray-900 cursor-pointer" onClick={() => router.push("/feed")}>Demos</h1>
            </div>
            <div className="flex items-center">
                {enableNewDiscussion && <div className="mr-4 rounded bg-gray-200 hover:bg-gray-400 transition duration-300">
                    <div className="px-1 py-2">
                    <Link href="/new-discussion" className="text-lg">
                        Nueva discusión
                    </Link>
                    </div>
                </div>
                }
                <div>
                    <SessionElements userName={userName}/>
                </div>
            </div>
        </header>

    );
};

export default Header;