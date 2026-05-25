"use client"
import {cn} from "@/lib/utils";
import Image from "next/image";
import {useTheme} from "@/components/layout/theme/theme-context";


const WorkInProgressScreen = () => {
    const {currentTheme} = useTheme()

    const title = <span className={""}>
        Paciencia, por favor.
    </span>

    const subtitle = <div>
        <div>
            Estamos trabajando en una nueva versión
        </div>
        <div>
            de Cabildo Abierto.
        </div>
    </div>

    const image = <Image
        src={"/presentacion/cabildo.svg"}
        alt={"Demo"}
        width={500}
        height={500}
        className={"w-full h-auto"}
    />

    return <div className={"flex flex-col items-center h-[calc(100vh-200px)] justify-center"}>
        <div className={"space-y-2"}>
            <div className={"flex justify-center pb-8 "}>
                <div className={cn("max-w-[200px] h-auto", currentTheme === "dark" ? "invert" : "")}>
                    {image}
                </div>
            </div>
            <h1 className={"text-xl md:text-2xl w-full normal-case text-center leading-none tracking-tight"}>
                {title}
            </h1>
            <div
                className={"text-lg md:text-xl text-center tracking-tight text-[1rem] max-w-[450px] font-extralight leading-tight"}
            >
                {subtitle}
            </div>
        </div>
    </div>
}


export default function Page() {

    return <div className={cn("presentation")}>
        <WorkInProgressScreen/>
    </div>
}