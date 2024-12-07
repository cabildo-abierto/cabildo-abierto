import { Login } from '../../components/login';
import {Metadata} from "next";
import {mainDescription} from "../../components/utils/metadata";
import Footer from "../../components/footer";

export const metadata: Metadata = {
    title: 'Cabildo Abierto',
    description: mainDescription
}

export default function Page() {

    return <div className="flex flex-col w-full items-center justify-center">
        <Login/>
        <Footer showCA={false}/>
    </div>
}