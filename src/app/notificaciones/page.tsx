"use client"
import {IconButton} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import {useLayoutConfig} from "../../components/layout/layout-config-context";
import {BackButton} from "../../components/ui-utils/back-button";
import {useRouter} from "next/navigation";
import {SmallBackButtonHeader} from "../../components/layout/small-back-button-header";


const Page = () => {
    const {layoutConfig, setLayoutConfig} = useLayoutConfig()
    const router = useRouter()

    return <div className={"flex flex-col"}>
        <div className={"flex items-center p-2 border-b space-x-2"}>
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
            <div className={"max-[500px]:hidden"}>
                <BackButton onClick={() => {router.back()}}/>
            </div>
            <div className={"font-bold text-lg"}>
                Notificaciones
            </div>
        </div>
        <div className={"text-center mt-8 text-[var(--text-light)]"}>
        Ninguna notificación por ahora.
        </div>
    </div>
}


export default Page