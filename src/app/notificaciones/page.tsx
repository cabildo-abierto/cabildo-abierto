import { getLastKNotifications } from "../../actions/contents"
import { NotificationComponent } from "../../components/notification"
import { ThreeColumnsLayout } from "../../components/three-columns"


const Page = async () => {
    const notifications = await getLastKNotifications(10)
    
    const center = <>
        <h1 className="py-8 text-2xl">Últimas notificaciones</h1>
        {notifications && <div>
            {notifications.length == 0 && <div className="text-center">No tenés ninguna notificación todavía.</div>}
            {notifications.length > 0 && <div className="space-y-2">{notifications.map((n, index) => {
                return <div key={index}>
                    <NotificationComponent notification={n}/>
                </div>
            })}</div>}
        </div>}
        {notifications && notifications.length > 10 && <div className="text-center text-[var(--text-light)] text-sm">
            Solo se muestran las notificaciones más recientes
        </div>}
    </>

    return <ThreeColumnsLayout center={center}/>
}


export default Page