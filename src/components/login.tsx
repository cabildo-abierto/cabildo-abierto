import Link from "next/link"
import { BlueskyLogin } from "./bsky-login"
import { TopbarLogo } from "./logo"


export const Login = ({newTab=false}: {newTab?: boolean}) => {
    return <div className="flex flex-col items-center w-[600px] py-12">
        <div className="mb-8">
            <TopbarLogo className="w-20 h-20 m-2"/>
        </div>

        <div className="flex justify-center">
            <div className="min-w-[500px] w-full flex flex-col items-center space-y-4 px-2 mb-4">
                <h1 className="">Iniciar sesión</h1>

                <BlueskyLogin newTab={newTab}/>

                <div className='text-center text-[var(--text-light)] mx-2'>
                    ¿No tenés una cuenta? <Link className="link2" target="_blank" href="https://bsky.app">Registrate en Bluesky</Link>.
                </div>
            </div>
        </div>
    </div>
}