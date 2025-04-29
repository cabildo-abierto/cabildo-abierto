"use client"


import Footer from "../../../modules/ui-utils/src/footer";
import {Logo} from "../../../modules/ui-utils/src/logo";
import {DimOnHoverLink} from "../../../modules/ui-utils/src/dim-on-hover-link";
import {SiBluesky} from "react-icons/si";
import {FaXTwitter} from "react-icons/fa6";

const Page = () => {
    return <div className={"h-screen flex flex-col justify-between lg:px-16"}>
        <div className={"flex flex-col items-center justify-center h-full space-y-4"}>
            <Logo/>
            <h2>
                Ocurrió un error en la conexión con el servidor...
            </h2>
            <div className={"text-[var(--text-light)] text-lg"}>
                Intentá de nuevo más tarde
            </div>
        </div>
    </div>
}


export default Page