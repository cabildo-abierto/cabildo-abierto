"use client"
import {IconButton} from "../../../../modules/ui-utils/src/icon-button"
import MenuIcon from "@mui/icons-material/Menu";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {BackButton} from "../../../../modules/ui-utils/src/back-button";
import {useNotifications} from "@/queries/api";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {NotificationCard} from "@/components/notification/notification-card";
import {useEffect} from "react";
import {useQueryClient} from "@tanstack/react-query";
import PageHeader from "../../../../modules/ui-utils/src/page-header";


const Page = () => {
    const {data: notifications, isLoading} = useNotifications()
    const qc = useQueryClient()

    useEffect(() => {
        qc.setQueryData(["unread-notifications-count"], 0)
    }, [qc])

    return <div className={"flex flex-col"}>
        <PageHeader title={"Notificaciones"}/>
        {isLoading && <div className={"mt-8"}>
            <LoadingSpinner/>
        </div>}
        {notifications != null && notifications.length == 0 && <div className={"text-center text-[var(--text-light)]"}>
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