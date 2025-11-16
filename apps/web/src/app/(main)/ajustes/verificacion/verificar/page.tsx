"use client"
import {BaseButton} from "@/components/utils/base/base-button";
import {Note} from "@/components/utils/base/note";
import ValidationIcon from "@/components/perfil/validation-icon";
import {useRouter} from "next/navigation";


export default function Page() {
    const router = useRouter()

    return <div className={"py-8 space-y-12"}>
        <Note>
            Verificá tu cuenta. Es fácil, gratis y cualquiera lo puede hacer.
        </Note>
        <div className={"space-y-4 flex flex-col justify-center items-center"}>
            <BaseButton
                className={"w-[300px]"}
                variant={"outlined"}
                onClick={() => {
                    router.push("/ajustes/verificacion/verificar/persona")
                }}
                startIcon={<ValidationIcon verification={"persona"}/>}
            >
                Es mi cuenta personal
            </BaseButton>
            <BaseButton
                className={"w-[300px]"}
                variant={"outlined"}
                onClick={() => {
                    router.push("/ajustes/verificacion/verificar/org")
                }}
                startIcon={<ValidationIcon verification={"org"}/>}
            >
                Represento a una organización
            </BaseButton>
        </div>
    </div>
}