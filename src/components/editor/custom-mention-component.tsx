import { getUsers, UserProps } from "@/actions/get-user";
import { BeautifulMentionComponentProps, BeautifulMentionsItem, BeautifulMentionsMenuItemProps, BeautifulMentionsMenuProps } from "lexical-beautiful-mentions";
import Link from "next/link";
import { forwardRef } from "react";

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
>(({ trigger, value, data: myData, children, ...other }: any, ref: any) => {
  return (
    <Link {...other} ref={ref} title={trigger + value} href={"/perfil/"+encodeURIComponent(myData.id.slice(1))}>
      {myData.id}
    </Link>
  );
});


export const queryMentions = async (trigger: string, query: string | undefined | null)=> {
  if(!query) return []
  const data = (await getUsers()).filter((user: UserProps) =>
    user.name.toLowerCase().includes(query.toLowerCase()),
  );
  return data.map(({ id, name }: any) => ({ id, value: name, name: name}))
};


export function CustomMenuMentions({ loading, ...props }: BeautifulMentionsMenuProps) {
  return (
    <ul
      className="m-0 mt-6 p-2 bg-white shadow-lg rounded-lg border border-gray-200 w-64"
      {...props}
    />
  );
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