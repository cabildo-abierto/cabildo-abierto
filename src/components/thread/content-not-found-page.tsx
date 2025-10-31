import {BaseButton} from "../layout/base/baseButton";
import Link from "next/link";


export const ContentNotFoundPage = () => {
    return <div className={"flex flex-col py-16 space-y-8 items-center"}>
        <div className={"text-center font-light"}>
            No se encontró el contenido
        </div>
        <Link href={"/inicio"}>
            <BaseButton variant={"outlined"}>
                Ir al inicio
            </BaseButton>
        </Link>
    </div>
}