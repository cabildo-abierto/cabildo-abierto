import {Button} from "../layout/utils/button";


export const ContentNotFoundPage = () => {
    return <div className={"flex flex-col py-16 space-y-8 items-center"}>
        <div className={"text-center font-light"}>
            No se encontró el contenido
        </div>
        <Button size={"small"} href={"/inicio"}>
            Ir al inicio
        </Button>
    </div>
}