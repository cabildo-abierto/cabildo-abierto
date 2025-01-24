import MainLayout from "../../components/layout/main-layout";
import PaywallChecker from "../../components/paywall-checker";
import React from "react";


export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
  return <MainLayout>
      <PaywallChecker requireAccount={false}>
      {children}
      </PaywallChecker>
    </MainLayout>
}