import Footer from "../components/footer"
import { Presentation } from "src/components/presentation"
import { AuthPage } from "src/components/auth-page"


export default function Page() {
    return <div className="flex h-screen">
        <div className="w-1/2">
            <Presentation/>
        </div>
        <div className="w-1/2">
            <AuthPage/>
        </div>
        <Footer/>
    </div>
}