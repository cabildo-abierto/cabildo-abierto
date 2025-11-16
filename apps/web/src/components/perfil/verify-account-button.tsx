import Link from "next/link";
import React from "react";


export function isVerified(verification?: string) {
    return verification && verification != "none"
}

export default function VerifyAccountButton({verification}: { verification?: string }) {
    if (!isVerified(verification)) {
        return <Link href={"/ajustes/verificacion/verificar"}>
            <button
                className={"flex bg-[var(--background-dark)] text-[11px] uppercase space-x-1 border px-2 text-[var(--text-light)] hover:bg-[var(--background-dark2)]"}
            >
                Verificar
            </button>
        </Link>
    }
    return null
}