import { Login } from '../../components/login';
import Footer from "../../components/footer";


export default function Page() {

    return <div className="flex flex-col w-full items-center justify-center">
        <Login/>
        <Footer showCA={false}/>
    </div>
}