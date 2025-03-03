"use client"

import {
    revalidateEverything, revalidateTags,
} from "../../../actions/admin"
import {tomasDid} from "../../../components/utils/utils";
import {useUser} from "../../../hooks/user";
import {NotFoundPage} from "../../../components/ui-utils/not-found-page";
import StateButton from "../../../components/ui-utils/state-button";




export default function Page() {
    const {user} = useUser()

    if(!user || (user.editorStatus != "Administrator" && user.did != tomasDid)){
        return <NotFoundPage/>
    }

    let center = <div className="flex flex-col items-center mt-8">

        <h1>Panel de administrador: Cache</h1>

        <div className="py-8 flex flex-col items-center space-y-2 w-64 text-center">

            <h2>Revalidar</h2>

            <StateButton
                handleClick={async () => {
                    await revalidateEverything()
                    return {}
                }}
                text1={"Revalidar todo"}
            />

            <StateButton
                handleClick={async () => {
                    await revalidateTags(["topics"])
                    return {}
                }}
                text1={"Revalidar temas"}
            />

        </div>
    </div>

    return center
}