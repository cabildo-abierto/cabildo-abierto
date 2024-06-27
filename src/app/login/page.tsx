import { Home } from "../home";
import LoginForm from "./login-form"
import Link from "next/link";

export default function LoginPage() {
    return (
        <div className="flex justify-between items-center">
            <div className="w-1/2">
                <Home/>
            </div>
            <div className="w-1/2 flex justify-center">
                <div className="w-1/2 mr-8 py-32">
                    <LoginForm/>
                    <div className='mt-4 text-center'>
                        No tenés una cuenta? <Link className='underline transition duration-300 ease-in-out hover:text-blue-500 hover:underline' href="/">Registrate</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}