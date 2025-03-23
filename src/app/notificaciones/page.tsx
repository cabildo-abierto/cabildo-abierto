"use client"
import NotificationsIconMui from '@mui/icons-material/Notifications';


const Page = () => {
    return <div className={"flex flex-col"}>
        <div className={"ml-6 py-1 flex items-baseline border-b space-x-2"}>
            <div className={"text-xl"}>
                <NotificationsIconMui fontSize={"inherit"}/>
            </div>
            <div className={"text-lg"}>
                Notificaciones
            </div>
        </div>
        <div className={"text-center mt-8 text-[var(--text-light)]"}>
            Ninguna notificación por ahora.
        </div>
    </div>
}


export default Page