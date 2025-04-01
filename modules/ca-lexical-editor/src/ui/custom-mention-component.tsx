"use client"
import { BeautifulMentionComponentProps, BeautifulMentionsMenuItemProps, BeautifulMentionsMenuProps } from "lexical-beautiful-mentions";
import { useRouter } from "next/navigation";
import { forwardRef } from "react";
import { getUsers } from "@/server-actions/user/users";

import {cleanText} from "@/utils/strings";

export const EmptyMentionResults = () => (
  <div className="top-[2px] m-0 min-w-[10rem] overflow-hidden ...">
    No se encontraron resultados.
  </div>
);

export type MentionProps = {
    name: string,
    id: string,
    value: string
}


export const CustomMentionComponent = forwardRef<
  HTMLDivElement,
  BeautifulMentionComponentProps<MentionProps>
>(({ data: myData }, ref) => {
  const router = useRouter()

  // Tuve que hacer esto porque Link abría en otra ventana por algún motivo
  // Investigar...

  const handleClick = () => {
    router.push("/perfil/"+encodeURIComponent(myData.id))
  }

  return (
    <button className="text-link" onClick={handleClick}>
      @{myData.id}
    </button>
  );
});

CustomMentionComponent.displayName = 'CustomMentionComponent';


export const queryMentions = async (trigger: string, query: string | undefined | null)=> {
    if(!query) return []
    const {users, error} = await getUsers()
    if(error) return []

    const cleanQuery = cleanText(query)

    const data = users.filter((user) =>
        (user.displayName && cleanText(user.displayName).includes(cleanQuery)) || cleanText(user.handle).includes(cleanQuery),
    )
    return data.map(({ id, name }: any) => ({ id, value: name, name: name}))
};


export function CustomMenuMentions({ loading, ...props }: BeautifulMentionsMenuProps) {
  return <ul
      className="m-0 mt-6 p-2 bg-[var(--background)] shadow-lg rounded-lg border border-gray-200 w-64"
      {...props}
  />
}

export const CustomMenuItemMentions = forwardRef<
  HTMLLIElement,
  BeautifulMentionsMenuItemProps
>(({ selected, item, ...props }, ref) => {
    return (
      <li
        className="m-0 px-2 flex items-center cursor-pointer hover:bg-gray-100 rounded"
        {...props}
        ref={ref}
      />
    );
  }
);

CustomMenuItemMentions.displayName = 'CustomMenuItemMentions';