"use client"
import {ModalOnHover} from "@/../modules/ui-utils/src/modal-on-hover"
import {ModalOnClick} from "../../../../modules/ui-utils/src/modal-on-click";


export default function Page(){
    const modal = <div className={"border p-2"}>
        Un modal
    </div>

    return <div className={"flex justify-center flex-col items-center space-y-32"}>
        <ModalOnHover modal={modal}>
            <div className={"border cursor-pointer p-2"}>
                Pasá el mouse por acá
            </div>
        </ModalOnHover>

        <ModalOnClick modal={modal}>
            <div className={"border cursor-pointer p-2"}>
                Hacé click acá
            </div>
        </ModalOnClick>
    </div>
}