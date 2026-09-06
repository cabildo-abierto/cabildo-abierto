import {Input} from "@/components/ui/input";


export default function Page() {

    return <div className={"min-h-[calc(100vh-3rem)] w-full flex items-center justify-center"}>
        <div className={"flex flex-col items-start space-y-3 p-3"}>
            <h1 className={"text-center w-full"}>
                Cabildo Abierto
            </h1>
            <div>
                <Input placeholder={"Buscá temas..."} className={"w-64"}/>
            </div>
        </div>
    </div>
}
