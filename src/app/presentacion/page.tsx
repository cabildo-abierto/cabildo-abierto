"use client"
import {GoToLoginButton} from "@/components/presentacion/go-to-login-button";
import {
    PresentacionAbierto,
    PresentacionCalidadDeLaInformacion, PresentacionFormato,
    PresentacionInicio, PresentacionRemuneraciones,
    PresentacionWiki
} from "@/components/presentacion/sections";
import {Suspense} from "react";
import Footer from "../../components/layout/utils/footer";


export default function Page() {

    return <Suspense>
        <div className="flex flex-col items-center h-full presentation">
            <PresentacionInicio/>
            <PresentacionFormato/>
            <PresentacionWiki/>
            <PresentacionCalidadDeLaInformacion/>
            <PresentacionRemuneraciones/>
            <PresentacionAbierto/>
            <div className="pb-8 z-10 bg-[var(--background-dark)] w-full flex justify-center">
                <GoToLoginButton
                    className="w-36 sm:w-48 font-bold sm:p-1"
                    fontSize={16}
                    text={"Empezar"}
                    color={"background-dark2"}
                />
            </div>
        </div>
        <Footer/>
    </Suspense>
}