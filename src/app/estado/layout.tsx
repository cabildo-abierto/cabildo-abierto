import "@/app/globals.css";
import WikiLayout from "@/components/wiki-layout";


export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
  return <WikiLayout children={children}/>
}