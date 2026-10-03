import {ArrowsClockwiseIcon, ArrowBendUpLeftIcon, ChatCircleIcon, CheckIcon, PencilSimpleIcon, XIcon} from "@phosphor-icons/react";
import type {Notification} from "@cabildo-abierto/api";
import {cn} from "@/lib/utils";

const icons = {
    comment: ChatCircleIcon,
    reply: ArrowBendUpLeftIcon,
    replica: ArrowsClockwiseIcon,
    rejection: XIcon,
    positive_vote: CheckIcon,
    edit: PencilSimpleIcon,
} as const;

export function NotificationIcon({kind}: {kind: Notification["kind"]}) {
    const Icon = icons[kind];
    return <Icon aria-hidden="true" weight="bold" className={cn(
        "mt-0.5 size-3.5 shrink-0 text-muted-foreground",
        (kind === "replica" || kind === "rejection") && "text-red-600 dark:text-red-400",
        kind === "positive_vote" && "text-green-700 dark:text-green-400",
        kind === "edit" && "text-primary",
    )}/>;
}
