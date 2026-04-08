"use client"

import React from "react"
import {CustomLink as Link} from "@/components/utils/base/custom-link"
import {PageFrame} from "@/components/utils/page-frame";
import {BaseButton} from "@/components/utils/base/base-button";


export default function RecuperacionPage() {

    return (
        <PageFrame>
            <div className="flex flex-col items-center">
                <div className="max-w-md w-full space-y-16 pb-16 flex flex-col items-center">
                    <h1 className="text-xl font-semibold normal-case">
                        Recuperá tu cuenta
                    </h1>
                    <div className={"flex flex-col space-y-8"}>
                        <Link href={"/recuperacion/clave"}>
                            <BaseButton variant={"outlined"} className={"normal-case w-56"}>
                                Olvidé mi contraseña
                            </BaseButton>
                        </Link>
                        <Link href={"/recuperacion/usuario"}>
                            <BaseButton variant={"outlined"} className={"normal-case w-56"}>
                                Olvidé mi nombre de usuario
                            </BaseButton>
                        </Link>
                    </div>
                </div>
            </div>
        </PageFrame>
    )
}

