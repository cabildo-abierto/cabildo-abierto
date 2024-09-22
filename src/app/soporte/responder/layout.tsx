import { AdminOnlyPage } from "../../../components/admin-only-page";


export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
  return <AdminOnlyPage>
      {children}
    </AdminOnlyPage>
}