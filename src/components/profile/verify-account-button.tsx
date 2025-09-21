import Link from "next/link";
import React from "react";


export default function VerifyAccountButton({verification}: { verification?: string }) {
    if (!verification || verification == "none") {
        return <Link href={"/ajustes/solicitar-validacion"}>
            <button className={"flex text-[11px] uppercase space-x-1 border px-2 text-[var(--text-light)] hover:bg-[var(--background-dark2)]"}>
                <div>
                    Verificar
                </div>
            </button>
        </Link>
    }
    return null
}