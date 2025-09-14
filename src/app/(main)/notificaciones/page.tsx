"use client"
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {NotificationCard} from "@/components/notification/notification-card";
import {useEffect} from "react";
import {useQueryClient} from "@tanstack/react-query";
import PageHeader from "../../../../modules/ui-utils/src/page-header";
import {useAPI} from "@/queries/utils";
import {ArCabildoabiertoNotificationListNotifications} from "@/lex-api/index"

function useNotifications() {
    return useAPI<ArCabildoabiertoNotificationListNotifications.Notification[]>("/notifications/list", ["notifications"])
}


const Page = () => {
    const {data: notifications, isLoading} = useNotifications()
    const qc = useQueryClient()

    useEffect(() => {
        qc.setQueryData(["unread-notifications-count"], () => 0)
    }, [qc])

    return <div className={"flex flex-col"}>
        <PageHeader title={"Notificaciones"}/>
        {isLoading && <div className={"mt-8"}>
            <LoadingSpinner/>
        </div>}
        {notifications != null && notifications.length == 0 && <div className={"py-16 text-center text-[var(--text-light)]"}>
            Sin notificaciones.
        </div>}
        {notifications && notifications.length > 0 && <div>
            {notifications.map((notification, i) => {
                return <div key={i}>
                    <NotificationCard notification={notification}/>
                </div>
            })
            }
        </div>}
    </div>
}


export default Page