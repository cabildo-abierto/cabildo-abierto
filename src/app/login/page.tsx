import { Suspense } from 'react';
import { Login } from '../../components/auth/login';
import Footer from "../../components/ui-utils/footer";


export default function Page() {

    return <div className="flex flex-col w-full items-center justify-between h-screen">
        <Suspense>
            <Login/>
        </Suspense>
        <Footer showCA={false}/>
    </div>
}