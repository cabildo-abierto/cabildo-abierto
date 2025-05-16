import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Error en el pago'
}


export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
    return <>{children}</>
}