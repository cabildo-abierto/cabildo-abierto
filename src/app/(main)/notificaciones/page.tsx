"use client"
import {IconButton} from "../../../../modules/ui-utils/src/icon-button"
import MenuIcon from "@mui/icons-material/Menu";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {BackButton} from "../../../../modules/ui-utils/src/back-button";


const Page = () => {
    const {layoutConfig, setLayoutConfig} = useLayoutConfig()

    return <div className={"flex flex-col"}>
        <div className={"flex items-center p-2 border-b space-x-2"}>
            <div className={"w-10 text-[var(--text-light)] min-[500px]:hidden"}>
                <IconButton
                    color={"transparent"}
                    onClick={() => {
                        setLayoutConfig({
                            ...layoutConfig,
                            openSidebar: true
                        })
                    }}
                >
                    <MenuIcon/>
                </IconButton>
            </div>
            <div className={"max-[500px]:hidden"}>
                <BackButton defaultURL={"/"}/>
            </div>
            <div className={"font-bold text-lg"}>
                Notificaciones
            </div>
        </div>
        <div className={"text-center mt-8 text-[var(--text-light)]"}>
            No es que no tengas notificaciones, es que todavía no las implementamos.
        </div>
    </div>
}


export default Page