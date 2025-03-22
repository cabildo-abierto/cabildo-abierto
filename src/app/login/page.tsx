import { Suspense } from 'react';
import { Login } from '../../components/auth/login';
import {Metadata} from "next";
import {getAvailableInviteCodes} from "../../actions/user/access";
import {mainDescription} from "../../components/utils/metadata";



export async function generateMetadata(
    { searchParams }: {searchParams: Promise<{c: string}>}
): Promise<Metadata> {
    const { c } = await searchParams

    if(c){
        const codes = await getAvailableInviteCodes()
        if(codes.includes(c)){
            return {
                title: "¡Sumate a Cabildo Abierto!",
                description: mainDescription,
                icons: {
                    icon: '/logo.svg',
                },
            }
        }
    }
}


export default function Page() {

    return <div className={"flex items-center justify-center"}>
        <Suspense>
            <Login/>
        </Suspense>
    </div>
}