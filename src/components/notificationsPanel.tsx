import { useNotifications } from "../app/hooks/user"
import { CloseButton } from "./close-button"
import LoadingSpinner from "./loading-spinner"
import { NotificationComponent } from "./notification"


export const NotificationsPanel = ({onClose}: {onClose: () => void}) => {
    const notifications = useNotifications()

    const nots = notifications.notifications
    return <div className="mb-8 bg-[var(--background)]">
        <div className="justify-end sm:hidden flex">
            <CloseButton onClose={onClose}/>
        </div>
        <h1 className="mb-8 sm:mt-8 text-2xl text-center px-1">Notificaciones</h1>
        {notifications.isLoading && <LoadingSpinner/>}
        {nots && <div className="px-3">
            {nots.length == 0 && <div className="text-center">No tenés ninguna notificación todavía.</div>}
            {nots.length > 0 && <div className="space-y-2">{nots.map((n, index) => {
                return <div key={index}>
                    <NotificationComponent notification={n}/>
                </div>
            })}</div>}
        </div>}
        {nots && nots.length > 10 && 
        <div className="text-center text-[var(--text-light)] text-sm">
            Solo se muestran las notificaciones más recientes
        </div>}
    </div>
}
