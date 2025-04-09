import AccountChecker from "../../components/auth/account-checker";
import {LayoutVisualizationEditor} from "@/components/layout/layout-visualization-editor";


export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
  return <LayoutVisualizationEditor>
      <AccountChecker>
        {children}
      </AccountChecker>
    </LayoutVisualizationEditor>
}