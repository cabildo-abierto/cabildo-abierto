import {FormatGrid} from "@/components/presentacion/sections";
import {ChevronDownIcon} from "lucide-react";
import Image from "next/image";

export const LandingFirstScreen = () => {

    return <div
        className={"relative w-full md:flex-row flex-col flex justify-center items-center h-[90vh] px-4 md:px-16 lg:px-32"}>
        <div className={"md:flex md:space-x-6 md:w-full md:justify-between md:items-center"}>
            <div className={"space-y-6"}>
                <h1 className={"max-w-[400px] md:pt-0 pt-16 leading-none tracking-[0.0167em] w-full flex justify-center text-xl md:text-2xl"}>
                    Estamos construyendo un nuevo espacio de discusión argentino.
                </h1>
                <div className={"max-w-[480px] text-xl md:text-2xl md:text-[1.3rem] font-light leading-tight"}>
                    <div>
                        Para informarnos, discutir y conectar con otros,
                    </div>
                    <div>
                        sin algoritmos en el medio.
                    </div>
                </div>
            </div>
            <div className={""}>
                <FormatGrid/>
            </div>
        </div>
        <div className={"absolute bottom-2 left-1/2 transform -translate-x-1/2"}>
            <ChevronDownIcon/>
        </div>
    </div>
}