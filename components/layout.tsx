import Header from "./header";
import { Inter } from 'next/font/google';
import { Lusitana } from 'next/font/google';

export const inter = Inter({ subsets: ['latin'] });
export const lusitana = Lusitana({ subsets: ['latin'], weight: ["400", "700"] });

export default function Layout({ children }) {
    return (
        <div className={lusitana.className}>
            <Header/>
            <main>{children}</main>
        </div>
    )
}