import Link from "next/link"
import { BlueskyLogin } from "./bsky-login"
import { TopbarLogo } from "./logo"
import Button from "@mui/material/Button";


export const Login = ({newTab=false}: {newTab?: boolean}) => {
    return <div className="flex flex-col items-center sm:w-[600px] py-12">
        <div className="mb-8">
            <TopbarLogo className="w-20 h-20 m-2"/>
        </div>

        <div className="flex justify-center">
            <div className="sm:min-w-[500px] w-full flex flex-col items-center space-y-4 px-2 mb-4">
                <h1 className="">Iniciar sesión</h1>

                <div className={"flex flex-col items-center link space-y-1 text-[var(--text-light)] text-center"}>
                    <div>Por ahora la plataforma está abierta solo por invitación.</div>
                    <div className={""}>
                        Iniciá sesión para sumarte a la lista de espera.
                    </div>
                </div>

                <BlueskyLogin newTab={newTab}/>

                <div className='text-sm text-center text-[var(--text-light)] mx-2'>
                    ¿No tenés una cuenta? <Link className="link2" target="_blank" href="https://bsky.app">Registrate en
                    Bluesky</Link>.
                </div>

                <div className='text-sm text-center text-[var(--text-light)] mx-2 flex flex-col'>
                    <div>¿Ya tenías una cuenta de la primera versión de Cabildo Abierto? </div>
                    <div><Link className="link2" href="/v1">Más información acá</Link>.</div>
                </div>
                <div className={"w-full link flex justify-center text-sm"}>
                    <Link href={"/"}>Volver al inicio</Link>
                </div>
            </div>
        </div>
    </div>
}