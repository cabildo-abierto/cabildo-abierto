import MainLayout from "../../components/layout/main-layout";
import { AdminLayout } from "../../components/admin/admin-layout";


export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
  return <MainLayout maxWidthCenter={"800px"}>
      <AdminLayout>
        {children}
      </AdminLayout>
    </MainLayout>
}