import Image from "next/image";
import Link from "next/link";
import React from "react";
import {lusitana} from "@/app/layout";
import {getUser} from "@/actions/get-user";
import {logout} from "@/actions/auth";


async function Sidebar() {
    const user = await getUser()

    return <div className={`${lusitana.className} h-screen flex flex-col`}>
        <ul className="flex-1">
            <li className="mb-8 mt-4">
                <Link href={"/feed"}
                      className={`text-3xl font-bold text-gray-900 cursor-pointer hover:bg-gray-300 rounded-lg px-1`}>
                    Demos
                </Link>
            </li>
            <li className="flex justify-center mb-4 mr-4 rounded-lg bg-gray-200 hover:bg-gray-400 transition duration-100 cursor-pointer px-2">
                <div className="px-1 py-2">
                    <Link href="/search" className="text-semibold">
                        Buscar
                    </Link>
                </div>
            </li>
            <li className="flex justify-center mb-8 mr-4 rounded-lg bg-gray-200 hover:bg-gray-400 transition duration-100 cursor-pointer px-2">
                <div className="px-1 py-2">
                    <Link href="/write" className="text-semibold">
                        Nueva discusión
                    </Link>
                </div>
            </li>
        </ul>
        <div className="mt-auto">
            <ul>
                <li className="mb-2">
                    <a href={`/profile/${user?.id}`}
                       className={`inline-block cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 tracking-wide text-lg px-1`}>
                        {user?.name}
                    </a>
                </li>
                <li className="mb-2">
                    <form action={logout}>
                        <button
                            className="cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 tracking-wide text-gray-400 px-1">
                            Cerrar sesión
                        </button>
                    </form>
                </li>
                </ul>
            </div>
        </div>
}


export default function FeedLayout({children}) {
    return <div>
        <div className="flex h-screen justify-center">
            <Sidebar/>
            <div className="w-1/3">
                {children}
            </div>
        </div>
        <div className="absolute bottom-0 right-0">
        <Image
                src="/parthenon1.png"
                alt="Parthenon"
                className="grayscale opacity-25"
                width={500}
                height={500}
                priority
            />
        </div>
    </div>
}
