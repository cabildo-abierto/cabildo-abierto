import "@/app/globals.css";
import MainLayout from "@/components/main-layout";


export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
    return <MainLayout children={children}/>
}
