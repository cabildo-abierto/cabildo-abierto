"use client"
import {ReactNode, Suspense} from "react";
import Footer from "@/components/layout/utils/footer";


export default function Layout({
                                   children
                               }: {
    children: ReactNode
}) {
    return <Suspense>
        {children}
        <Footer/>
    </Suspense>
}