
import Link from 'next/link';
import { BlueskyLogin } from '../../components/bsky-login';
import { TopbarLogo } from '../../components/logo';


export default function Page() {
    return <div className="flex flex-col items-center h-screen justify-between">
        <div className="flex flex-col h-full items-center justify-center">
            <div className="mb-8">
                <TopbarLogo className="w-20 h-20 m-2"/>
            </div>

            <div className="w-screen flex justify-center">
                <div className="max-w-[450px] w-full flex flex-col items-center space-y-4 px-2 mb-4">
                    <h1 className="">Iniciar sesión</h1>

                    <BlueskyLogin/>

                    <div className='text-center mx-2'>
                        ¿No tenés una cuenta de Bluesky? <Link className="link2" target="_blank" href="https://bsky.app">Registrate</Link>.
                    </div>
                </div>
            </div>
        </div>
    </div>
}