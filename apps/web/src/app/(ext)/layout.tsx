"use client"
import {ReactNode, Suspense} from "react";
import Footer from "@/components/presentacion/footer";
import {cn} from "@/lib/utils";


export default function Layout({
                                   children
                               }: {
    children: ReactNode
}) {
    const isWipView = process.env.NEXT_PUBLIC_WEB_VIEW === "wip"

    return <Suspense>
        <div className={cn(
            "flex flex-col justify-between",
            isWipView ? "h-screen overflow-hidden" : "min-h-screen"
        )}>
        {children}
        <Footer
            showCA={!isWipView}
            className={isWipView ? "py-8 md:py-10 shrink-0" : undefined}
        />
        </div>
    </Suspense>
}
