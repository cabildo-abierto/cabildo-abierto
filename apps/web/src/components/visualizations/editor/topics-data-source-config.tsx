import {Note} from "@/components/utils/base/note";
import {FunnelIcon} from "@phosphor-icons/react";


export const TopicsDataSourceConfig = () => {
    return <div className={"flex flex-col items-center pt-12 cursor-normal px-4"}>
        <Note>
            Usá filtros (<FunnelIcon className={"inline-block"} fontSize={14}/>) para elegir una lista de temas de la wiki, que van a ser los datos de tu visualización.
        </Note>
    </div>
}