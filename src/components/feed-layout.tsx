import {lusitana} from "@/app/layout";
import Header from "@/components/header";
import Image from "next/image";


export default function FeedLayout({children, enableNewDiscussion}) {
    return <div>
        <div className="absolute bottom-0 right-0">
            <Image
                src="/parthenon1.png"
                alt="Parthenon"
                className="grayscale opacity-25"
                width={500}
                height={500}
                priority
            />
        </div>

        <div>
            <Header enableNewDiscussion={enableNewDiscussion}/>
            <div className="pt-20">
                {children}
            </div>
        </div>
    </div>
}