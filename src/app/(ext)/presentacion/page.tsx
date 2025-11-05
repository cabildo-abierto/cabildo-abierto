"use client"
import {GoToLoginButton} from "@/components/presentacion/go-to-login-button";
import {
    PresentacionAbierto,
    PresentacionCalidadDeLaInformacion, PresentacionFormato,
    PresentacionInicio, PresentacionRemuneraciones,
    PresentacionWiki
} from "@/components/presentacion/sections";


export default function Page() {

    return <div className="flex flex-col items-center h-full presentation">
        <PresentacionInicio/>
        <PresentacionFormato/>
        <PresentacionWiki/>
        <PresentacionCalidadDeLaInformacion/>
        <PresentacionRemuneraciones/>
        <PresentacionAbierto/>
        <div className="pb-8 z-10 bg-[var(--background-dark)] portal group w-full flex justify-center">
            <GoToLoginButton
                textClassName="w-36 sm:w-48 font-semibold sm:p-1 text-[16px]"
                text={"Empezar"}
            />
        </div>
    </div>
}