"use client"

import {useTheme} from "@/components/layout/theme/theme-context";
import {cn} from "@/lib/utils";
import Image from "next/image";

export const WorkInProgressScreen = () => {
    const {currentTheme} = useTheme()

    return <div className={"flex flex-1 flex-col items-center justify-center min-h-0"}>
        <div className={"space-y-2"}>
            <div className={"flex justify-center pb-8"}>
                <div className={cn("max-w-[200px] h-auto", currentTheme === "dark" ? "invert" : "")}>
                    <Image
                        src={"/presentacion/cabildo.svg"}
                        alt={"Cabildo Abierto"}
                        width={500}
                        height={500}
                        className={"w-full h-auto"}
                    />
                </div>
            </div>
            <h1 className={"text-xl md:text-2xl w-full normal-case text-center leading-none tracking-tight"}>
                Paciencia, por favor.
            </h1>
            <div
                className={"text-lg md:text-xl text-center tracking-tight text-[1rem] max-w-[450px] font-extralight leading-tight"}
            >
                <div>Estamos trabajando en una nueva versión</div>
                <div>de Cabildo Abierto.</div>
            </div>
        </div>
    </div>
}
