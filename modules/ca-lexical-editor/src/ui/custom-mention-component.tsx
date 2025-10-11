import {
    BeautifulMentionComponentProps,
    BeautifulMentionsMenuItemProps,
    BeautifulMentionsMenuProps
} from "lexical-beautiful-mentions";
import {forwardRef} from "react";
import Link from "next/link";
import {ProfilePic} from "@/components/profile/profile-pic";
import LoadingSpinner from "@/components/layout/utils/loading-spinner";
import {profileUrl} from "@/utils/uri";


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
}


export const CustomMentionComponent = forwardRef<
    HTMLDivElement,
    BeautifulMentionComponentProps<MentionProps>
>(({data: myData}, ref) => {

    return <Link className={"text-link"} key={myData.did} href={profileUrl(myData.handle)}>
        @{myData.handle}
    </Link>
})

CustomMentionComponent.displayName = 'CustomMentionComponent';

export function CustomMenuMentions({loading, children, ...props}: BeautifulMentionsMenuProps) {
    return <ul
        className="absolute p-1 space-y-1 z-[1300] panel-dark w-80 flex flex-col items-center justify-center"
        {...props}
    >
        {loading && <LoadingSpinner/>}
        {!loading && children}
    </ul>
}

export const CustomMenuItemMentions = forwardRef<
    HTMLLIElement,
    BeautifulMentionsMenuItemProps
>(({selected, item}, ref) => {
    return (
            <li
                className="m-0 flex p-2 w-full items-center space-x-2 cursor-pointer hover:bg-[var(--background-dark3)]"
                ref={ref}
            >
                <div className={"flex items-center"}>
                    <ProfilePic user={item.data} className={"w-5 h-5 rounded-full"}/>
                </div>
                <div className={"truncate flex items-center"}>
                    {item.data.handle}
                </div>
            </li>
        );
    }
);

CustomMenuItemMentions.displayName = 'CustomMenuItemMentions';