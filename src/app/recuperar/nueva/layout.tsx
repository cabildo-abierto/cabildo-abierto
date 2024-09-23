import { Metadata } from "next"


export const metadata: Metadata = {
    title: 'Nueva contraseña'
}

export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
  return <>
      {children}
    </>
}