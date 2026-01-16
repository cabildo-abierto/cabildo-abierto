import {ChevronDownIcon} from "lucide-react";
import Image from "next/image";

export const LandingFirstScreen = () => {

    const title = <span className={""}>
        Un nuevo foro argentino.
    </span>

    const subtitle = <div>
        Información y discusión, sin algoritmos en el medio.
    </div>

    const image = <Image
        src={"/presentacion/light/juntas.png"}
        alt={"Demo"}
        width={500}
        height={500}
        className={"w-full h-auto"}
    />

    return <>

        {/* 768 a 1500px, default = 1280px */}
        <div
            className={"bg-[var(--accent-dark2)] min-[768px]:flex min-[1500px]:hidden hidden relative w-full justify-center items-center h-[90vh]"}>
            <div className={"flex w-full justify-between space-x-6 lg:space-x-12 items-center px-6 lg:px-12"}>
                <div className={"w-1/2 flex flex-col items-center "}>
                    <div className={"space-y-4"}>
                        <h1 className={"w-full text-[var(--background)] normal-case leading-none tracking-tight text-2xl"}>
                            {title}
                        </h1>
                        <div
                            className={"text-xl text-[var(--background)] tracking-tight text-[1rem] max-w-[450px] lg:text-xl lg:text-[1.3rem] font-extralight leading-tight"}
                        >
                            {subtitle}
                        </div>
                    </div>
                </div>
                <div className={"w-1/2 flex justify-center"}>
                    <div className={"w-[80%]"}>
                        {image}
                    </div>
                </div>
            </div>
            <div className={"absolute bottom-2 left-1/2 transform -translate-x-1/2 text-[var(--background)]"}>
                <ChevronDownIcon/>
            </div>
        </div>

        {/* 1500px+, default = 1600px */}
        <div
            className={"bg-[var(--accent-dark2)] min-[1500px]:flex hidden relative w-full justify-center items-center h-[90vh]"}
        >
            <div className={"flex w-full justify-between space-x-12 items-center px-12"}>
                <div className={"w-1/2 flex flex-col items-center"}>
                    <div className={"space-y-6"}>
                        <h1 className={"normal-case leading-none text-[var(--background)] tracking-tight text-3xl"}>
                            {title}
                        </h1>
                        <div
                            className={"text-[1rem] text-[var(--background)] text-xl lg:text-[1.6rem] font-light leading-tight"}>
                            {subtitle}
                        </div>
                    </div>
                </div>
                <div className={"w-1/2 flex justify-center"}>
                    {image}
                </div>
            </div>
            <div className={"absolute bottom-2 text-[var(--background)] left-1/2 transform -translate-x-1/2"}>
                <ChevronDownIcon/>
            </div>
        </div>

        {/* < 768px, default = 360px */}
        <div
            className={"bg-[var(--accent-dark2)] min-[768px]:hidden flex relative w-full flex-col justify-center items-center px-8"}>
            <div className={"pt-24 pb-16 space-y-8"}>
                <div className={"w-full flex justify-center items-center"}>
                    <div className={"space-y-2 w-full max-w-[480px]"}>
                        <h1 className={"normal-case max-w-[360px] leading-none tracking-tight w-full text-base text-[1.1rem] text-[var(--background)]"}>
                            {title}
                        </h1>
                        <div className={"text-sm text-[var(--background)] font-light text-[1.1rem] leading-tight"}>
                            {subtitle}
                        </div>
                    </div>
                </div>
                <div className={"max-w-[360px] w-full flex justify-center items-center"}>
                    <div>
                        {image}
                    </div>
                </div>
                <div className={"absolute text-[var(--background)] bottom-2 left-1/2 transform -translate-x-1/2"}>
                    <ChevronDownIcon/>
                </div>
            </div>
        </div>
    </>
}