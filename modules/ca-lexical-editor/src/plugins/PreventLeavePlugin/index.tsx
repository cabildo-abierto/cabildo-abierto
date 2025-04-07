import {useEffect} from 'react';
import {usePageLeave} from "../../../../ui-utils/src/prevent-leave";

export function PreventLeavePlugin({uniqueId}: { uniqueId: string }) {
    const {leaveStoppers, setLeaveStoppers} = usePageLeave()

    useEffect(() => {
        return () => {
            if (uniqueId && !leaveStoppers.includes(uniqueId)) {
                setLeaveStoppers([...leaveStoppers, uniqueId])
            }
        }
    }, [leaveStoppers, setLeaveStoppers, uniqueId])

    return null;
}
