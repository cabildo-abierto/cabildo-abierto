import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Pago exitoso'
}


export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
    return <>{children}</>
}