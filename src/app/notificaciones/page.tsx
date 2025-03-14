"use client"
import NotificationsIconMui from '@mui/icons-material/Notifications';


const Page = () => {
    return <div className={"flex flex-col"}>
        <div className={"ml-6 mt-6 flex items-center space-x-2"}>
            <div className={"text-3xl"}>
                <NotificationsIconMui fontSize={"inherit"}/></div>
            <div className={"text-2xl"}>Notificaciones
            </div>
        </div>
        <div className={"text-center mt-8 text-[var(--text-light)]"}>
            Ninguna notificación por ahora.
        </div>
    </div>
}


export default Page