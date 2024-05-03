import "@/app/globals.css";
import Header from "@/components/header";
import {lusitana} from "@/app/layout";


export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className={`${lusitana.className} antialiased`}>
            <Header enableNewDiscussion={false}/>
            {children}
        </div>
    );
}
