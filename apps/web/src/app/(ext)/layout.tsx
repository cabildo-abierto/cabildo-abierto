"use client"
import {ReactNode, Suspense} from "react";
import Footer from "@/components/presentacion/footer";


export default function Layout({
                                   children
                               }: {
    children: ReactNode
}) {
    return <Suspense>
        <div className={"flex flex-col min-h-screen justify-between"}>
        {children}
        <Footer/>
        </div>
    </Suspense>
}