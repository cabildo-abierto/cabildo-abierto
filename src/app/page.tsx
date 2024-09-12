import { AuthPage } from "../components/auth-page"
import Footer from "../components/footer"
import { Presentation } from "../components/presentation"


export default function Page() {
    return <div className="flex lg:flex-row flex-col">
        <div className="lg:w-1/2 lg:mb-8 lg:flex lg:justify-center lg:items-center">
            <Presentation/>
        </div>
        <div className="lg:w-1/2 h-screen">
            <AuthPage/>
        </div>
        <Footer/>
    </div>
}