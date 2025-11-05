import {ReactNode} from "react";


export default function Layout({children}: {children: ReactNode}) {
    return <div className={"space-y-6 p-8 mt-12 portal group panel-dark"}>
        {children}
    </div>
}