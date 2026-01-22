"use client"
import {useRouter} from "next/navigation";
import {ReactNode} from "react";
import {CardholderIcon, ChecksIcon, IdentificationCardIcon, ShieldCheckIcon} from "@phosphor-icons/react";
import {BaseButton} from "@/components/utils/base/base-button";
import {Note} from "@/components/utils/base/note";


const ListItem = ({children}: {
    children: ReactNode
}) => {
    return <li
        className={"flex space-x-2 items-center"}
    >
        <ChecksIcon size={18} weight="bold"/>
        <div>
            {children}
        </div>
    </li>
}


export default function Page() {
    const router = useRouter()

    return <>
        <div className={"space-y-4 font-light"}>
            <div>
                Verificando tu cuenta personal les garantizás a tus interlocutores que sos una persona real. Además, al
                verificarte:
            </div>
            <ul>
                <ListItem>
                    Se remunera mensualmente a los autores que leés.
                </ListItem>
                <ListItem>
                    Aumentan tus permisos de edición en la wiki.
                </ListItem>
                <ListItem>
                    Aumenta tu impacto en métricas de popularidad.
                </ListItem>
                <ListItem>
                    Se te prioriza en las secciones de respuestas.
                </ListItem>
            </ul>
        </div>
        <div className={"flex flex-col space-y-4 py-8 justify-center items-center"}>
            <BaseButton
                startIcon={<IdentificationCardIcon/>}
                variant={"outlined"}
                className={"w-[320px] normal-case"}
                onClick={() => {
                    router.push("/ajustes/verificacion/verificar/persona/dni")
                }}
            >
                Verificar con una foto del DNI
            </BaseButton>
            <BaseButton
                startIcon={<CardholderIcon/>}
                variant={"outlined"}
                className={"w-[320px] normal-case"}
                onClick={() => {
                    router.push("/ajustes/verificacion/verificar/persona/mp")
                }}
            >
                Verificar con Mercado Pago
            </BaseButton>
        </div>
        <div
            className={"flex px-4 space-x-4 py-4 items-center text-[var(--text-light)]"}
        >
            <div className={"min-w-12 flex justify-center"}>
                <ShieldCheckIcon
                    fontSize={32}
                    color={"var(--text-light)"}
                    weight={"bold"}
                />
            </div>
            <Note className={"text-left"}>
                No almacenamos tus datos personales luego de la verificación.
            </Note>
        </div>
    </>
}
