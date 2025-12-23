import {FormatGrid} from "@/components/presentacion/sections";
import {ChevronDownIcon} from "lucide-react";

export const LandingFirstScreen = () => {

    const title = <div>
        <div>
            Un nuevo espacio de discusión
        </div>
        <div>
            argentino.
        </div>
    </div>
    const subtitle = <>
        <div>
            Para informarnos, discutir y conectar con otros,
        </div>
        <div>
            sin algoritmos en el medio.
        </div>
    </>

    const image = <FormatGrid/>

    return <>

        {/* 768 a 1439px, default = 1280px */}
        <div
            className={"min-[768px]:flex min-[1439px]:hidden hidden relative w-full justify-center items-center h-[90vh]"}>
            <div className={"flex w-full justify-between space-x-6 lg:space-x-12 items-center px-6 lg:px-12"}>
                <div className={"w-1/2 flex flex-col items-center"}>
                    <div className={"space-y-6"}>
                        <h1 className={"leading-none tracking-tight text-xl lg:text-2xl"}>
                            {title}
                        </h1>
                        <div
                            className={"text-xl text-[1rem] lg:text-2xl lg:text-[1.3rem] font-light leading-tight"}>
                            {subtitle}
                        </div>
                    </div>
                </div>
                <div className={"w-1/2 flex justify-center"}>
                    {image}
                </div>
                <div className={"absolute bottom-2 left-1/2 transform -translate-x-1/2"}>
                    <ChevronDownIcon/>
                </div>
            </div>
        </div>

        {/* 1440px+, default = 1600px */}
        <div
            className={"min-[1439px]:flex hidden relative w-full justify-center items-center h-[90vh]"}>
            <div className={"flex w-full justify-between space-x-12 items-center px-12"}>
                <div className={"w-1/2 flex flex-col items-center"}>
                    <div className={"space-y-6"}>
                        <h1 className={"leading-none tracking-tight text-3xl"}>
                            {title}
                        </h1>
                        <div
                            className={"text-[1rem] text-3xl lg:text-[1.6rem] font-light leading-tight"}>
                            {subtitle}
                        </div>
                    </div>
                </div>
                <div className={"w-1/2 flex justify-center"}>
                    {image}
                </div>
                <div className={"absolute bottom-2 left-1/2 transform -translate-x-1/2"}>
                    <ChevronDownIcon/>
                </div>
            </div>
        </div>

        {/* < 768px, default = 360px */}
        <div
            className={"min-[768px]:hidden flex relative w-full flex-col justify-center items-center px-8"}>
            <div className={"pt-24 pb-16"}>
                <div className={"w-full flex justify-center items-center"}>
                    <div className={"space-y-2 w-full max-w-[480px]"}>
                        <h1 className={"max-w-[360px] leading-none tracking-tight w-full text-xl text-[1.1rem]"}>
                            {title}
                        </h1>
                        <div className={"text-xl font-light text-[1.1rem] leading-tight"}>
                            {subtitle}
                        </div>
                    </div>
                </div>
                <div className={"max-w-[360px] w-full flex justify-center items-center"}>
                    <div>
                        {image}
                    </div>
                </div>
                <div className={"absolute bottom-2 left-1/2 transform -translate-x-1/2"}>
                    <ChevronDownIcon/>
                </div>
            </div>
        </div>
    </>
}