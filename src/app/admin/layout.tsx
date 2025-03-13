import MainLayout from "../../components/layout/main-layout";
import AccountChecker from "../../components/auth/account-checker";
import { AdminLayout } from "../../components/admin/admin-layout";


export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
  return <MainLayout>
      <AdminLayout>
        {children}
      </AdminLayout>
    </MainLayout>
}