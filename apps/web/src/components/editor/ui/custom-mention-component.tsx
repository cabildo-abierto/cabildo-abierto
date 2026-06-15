import {
    BeautifulMentionComponentProps,
    BeautifulMentionsMenuItemProps,
    BeautifulMentionsMenuProps
} from "lexical-beautiful-mentions";
import {forwardRef} from "react";
import {ProfilePic} from "@/components/perfil/profile-pic";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import BlueskyLogo from "../../utils/icons/bluesky-logo";
import {cn} from "@/lib/utils";


export const EmptyMentionResults = () => (
    <div
        className="mt-4 min-w-[10rem] text-sm text-[var(--text-light)] overflow-hidden border rounded-lg bg-[var(--background-dark)] p-2 ...">
        No se encontraron resultados.
    </div>
);

export type MentionProps = {
    did: string
    handle: string
    displayName?: string
    avatar?: string
    value: string
    inCA: boolean
}


export const CustomMentionComponent = forwardRef<
    HTMLSpanElement,
    BeautifulMentionComponentProps<MentionProps>
>(({ trigger, value, data: myData, className }, ref) => {
    return (
        <span
            ref={ref}
            title={trigger + value}
            className={cn("text-[var(--text-light)] hover:underline", className)}
        >
            @{myData.handle}
        </span>
    )
})

CustomMentionComponent.displayName = 'CustomMentionComponent';

export function CustomMenuMentions({loading, children, className, ...props}: BeautifulMentionsMenuProps) {
    return <ul
        className={cn(
            "absolute top-2 left-0 space-y-1 z-[1600] pointer-events-auto panel-dark w-80 flex flex-col items-center justify-center",
            loading && "py-4",
            className
        )}
        {...props}
    >
        {loading && <LoadingSpinner/>}
        {!loading && children}
    </ul>
}

export const CustomMenuItemMentions = forwardRef<
    HTMLLIElement,
    BeautifulMentionsMenuItemProps
>(({selected, item, inCA, displayName, itemValue, label, ...props}, ref) => {
    return (
            <li
                className="m-0 flex p-2 w-full items-center space-x-2 cursor-pointer hover:bg-[var(--background-dark3)]"
                ref={ref}
                {...props}
            >
                <div className={"flex items-center"}>
                    <ProfilePic user={item.data} className={"w-5 h-5 rounded-full"}/>
                </div>
                <span className={"truncate flex items-center"}>
                    @{item.data.handle}
                </span>
                {!item.data.inCA && <BlueskyLogo className={"h-[10px] w-auto"}/>}
            </li>
        );
    }
);

CustomMenuItemMentions.displayName = 'CustomMenuItemMentions';