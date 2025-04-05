import { BeautifulMentionComponentProps, BeautifulMentionsMenuItemProps, BeautifulMentionsMenuProps } from "lexical-beautiful-mentions";
import { forwardRef } from "react";
import Link from "next/link";
import {SmallUserProps} from "@/lib/definitions";
import {ProfilePic} from "@/components/feed/profile-pic";

export const EmptyMentionResults = () => (
    <div className="mt-4 min-w-[10rem] text-[var(--text-light)] overflow-hidden border rounded-lg bg-[var(--background-dark)] p-2 ...">
        No se encontraron resultados.
    </div>
);

export type MentionProps = SmallUserProps & {
    value: string
}


export const CustomMentionComponent = forwardRef<
  HTMLDivElement,
  BeautifulMentionComponentProps<MentionProps>
>(({ data: myData }, ref) => {

    return <Link className={"text-link"} key={myData.did} href={"/perfil/"+encodeURIComponent(myData.id)}>
        @{myData.handle}
    </Link>
})

CustomMentionComponent.displayName = 'CustomMentionComponent';

export function CustomMenuMentions({ loading, ...props }: BeautifulMentionsMenuProps) {
  return <ul
      className="mt-4 p-2 space-y-2 bg-[var(--background-dark)] rounded-lg border w-80 flex flex-col items-center justify-center"
      {...props}
  />
}

export const CustomMenuItemMentions = forwardRef<
  HTMLLIElement,
  BeautifulMentionsMenuItemProps
>(({ selected, item, ...props }, ref) => {
    return (
        <li
            className="flex p-2 w-72 items-center space-x-2 cursor-pointer hover:bg-[var(--background-dark2)] rounded-lg"
            key={item.data.id}
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