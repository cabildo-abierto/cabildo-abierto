"use client"
import Link from 'next/link'
import {BaseButton} from "@/components/utils/base/base-button";
import {LinkBreakIcon} from "@phosphor-icons/react";


export const NotFoundPage = () => {
    return <div className="text-center flex flex-col items-center justify-center pt-32">
        <div className={"p-8 flex flex-col items-center space-y-8"}>
            <div>
                <LinkBreakIcon fontSize={64} color={"var(--text)"}/>
            </div>
            <h2>
                ¡Algo salió mal!
            </h2>
            <p className="text-lg text-[var(--text-light)] font-light">
                No pudimos encontrar la página.
            </p>
            <Link href="/inicio">
                <BaseButton size={"small"} variant={"outlined"}>
                    Volver al inicio
                </BaseButton>
            </Link>
        </div>
    </div>
}