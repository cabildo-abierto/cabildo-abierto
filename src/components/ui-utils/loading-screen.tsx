import { Logo } from "./logo"



export const LoadingScreen = () => {
    return <div className="flex flex-col justify-center items-center w-screen h-screen">
        <div className="relative">
        <Logo className="w-16 h-16"/>
        </div>
    </div>
}