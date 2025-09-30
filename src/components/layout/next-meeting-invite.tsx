import React from "react";
import {CustomLink as Link} from '../../../modules/ui-utils/src/custom-link';
import {useNextMeeting} from "@/queries/getters/useNextMeeting";
import {useLayoutConfig} from "./layout-config-context";
import {formatIsoDate} from "@/utils/dates";


const NextMeetingInvite = () => {
    const {layoutConfig} = useLayoutConfig()
    const {data: meetingData} = useNextMeeting()

    if (!layoutConfig.spaceForRightSide) {
        if (layoutConfig.openSidebar && meetingData && meetingData.show) {
            return <div className={"bg-[var(--background-dark2)] mb-2 border rounded-lg p-2 text-xs"}>
                <div className={"font-semibold"}>
                    {meetingData.title}
                </div>
                <div className={"text-[var(--text-light)] text-[11px]"}>
                    {meetingData.description}
                </div>
                <div className={"text-[var(--text-light)]"}>
                    <span className={"font-semibold"}>Link:</span> <Link
                    href={meetingData.url}
                    target={"_blank"}
                    className={"hover:underline"}
                >
                    {meetingData.url.replace("https://", "")}
                </Link>
                </div>
                <div className={"text-[var(--text-light)]"}>
                    {formatIsoDate(meetingData.date, true, true, false)}hs.
                </div>
            </div>
        }
    }

    return null
}


export default NextMeetingInvite