"use client"
import {IconButton} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import {useLayoutConfig} from "../../components/layout/layout-config-context";
import {BackButton} from "../../components/ui-utils/back-button";
import {useRouter} from "next/navigation";


const Page = () => {
    const {layoutConfig, setLayoutConfig} = useLayoutConfig()
    const router = useRouter()

    return <div className={"flex flex-col"}>
        <div className={"flex items-center px-2 border-b space-x-2 h-10"}>
            <div className={"w-10 text-[var(--text-light)] min-[500px]:hidden"}>
                <IconButton
                    color={"inherit"}
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
            <div className={"flex space-x-2 items-center w-full px-2 py-4"}>
                <div className={""}>
                    <BackButton size="small" onClick={() => {
                        router.back()
                    }}/>
                </div>
                <div className={"font-bold text-lg"}>
                    Notificaciones
                </div>
            </div>
        </div>
        <div className={"text-center mt-8 text-[var(--text-light)]"}>
            Ninguna notificación por ahora.
        </div>
    </div>
}


export default Page