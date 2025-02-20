import MainLayout from "../../components/layout/main-layout";

const RootLayout = ({children} :{
  children: React.ReactNode
}) => {

  return <MainLayout>
      {children}
    </MainLayout>
}

export default RootLayout