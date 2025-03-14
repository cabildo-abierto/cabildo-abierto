import { Suspense } from 'react';
import { Login } from '../../components/auth/login';


export default function Page() {

    return <div className={"flex items-center justify-center"}>
        <Suspense>
            <Login/>
        </Suspense>
    </div>
}