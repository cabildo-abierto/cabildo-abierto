"use client"

import React, {ReactNode, useState} from "react"
import {BaseFullscreenPopup} from "@/components/utils/dialogs/base-fullscreen-popup"
import {AtPermissionsPanel} from "@/components/mensajes/at-permissions-panel"

export function AtPermissionsModal({children}: {children: ReactNode}) {
    const [open, setOpen] = useState(false)

    return (
        <>
            <div className="inline-flex" role="presentation" onClick={() => setOpen(true)}>
                {children}
            </div>
            <BaseFullscreenPopup
                open={open}
                onClose={() => setOpen(false)}
                closeButton
                backgroundShadow
                ariaLabelledBy="at-permissions-title"
                className="p-4 max-w-lg gap-4 overflow-y-auto custom-scrollbar border border-[var(--accent-dark)] rounded-lg shadow-lg"
                fullscreenOnMobile
                title={"Permisos de la Atmósfera"}
            >
                <AtPermissionsPanel
                    loadWhen={open}
                    onAuthSuccess={() => setOpen(false)}
                />
            </BaseFullscreenPopup>
        </>
    )
}
