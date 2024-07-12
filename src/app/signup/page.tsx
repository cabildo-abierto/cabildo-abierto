import { Home } from "../home";
import SignupForm from "./signup-form"
import Link from "next/link";

export default function SignupPage() {
    return <div className="">
    <div className="flex justify-between">
        <div className="w-1/2 mt-32">
            <Home/>
        </div>
        <div className="w-1/2 flex justify-center">
            <div className="w-1/2 mr-8 py-32">
                <SignupForm/>
                <div className='mt-4 text-center'>
                    Ya tenés una cuenta? <Link className='underline transition duration-300 ease-in-out hover:text-blue-500 hover:underline' href="/">Iniciá sesión</Link>
                </div>
            </div>
        </div>
    </div>
</div>
}