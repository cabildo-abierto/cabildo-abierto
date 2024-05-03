import { logout } from "@/actions/auth";
import Link from 'next/link';
import {redirect} from "next/navigation";

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

const Header = async ({enableNewDiscussion}) => {
    return (
        <header className="bg-gray-50 border flex justify-between">
            <div className="flex px-2 py-2">
                <Link href={"/feed"}>
                    <h1 className="text-3xl font-bold text-gray-900 cursor-pointer">Demos</h1>
                </Link>
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
                    <SessionElements userName={"Tu usuario"}/>
                </div>
            </div>
        </header>

    );
};

export default Header;