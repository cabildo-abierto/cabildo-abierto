import { AdminOnlyPage } from "../../../components/admin-only-page";
import { Metadata } from "next"


export const metadata: Metadata = {
    title: 'Soporte'
}

export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
  return <AdminOnlyPage>
      {children}
    </AdminOnlyPage>
}