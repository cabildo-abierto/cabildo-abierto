import React from "react";
import SearchPage from "./search-page";
import Link from "next/link";
import { UserProps } from "@/actions/get-user";
import { ContentProps } from "@/actions/get-content";


const SearchSidebar: React.FC<{searchValue: string, user: UserProps, contents: Record<string, ContentProps>}> = (
  {searchValue, user, contents}) => {
  return <div className="fixed top-16 right-0 h-screen-minus-16 border-l z-10">
      <div className="flex justify-end h-full bg-white">
        <div className="bg-white h-full flex flex-col justify-between lg:w-96 w-screen">
          <div className="h-full overflow-scroll">
            <SearchPage contents={contents} user={user} searchValue={searchValue}/>
          </div>
          <div>
            <hr className="mt-2"/>
            <div className="flex justify-center py-2">
              <Link href={"/buscar/"+encodeURIComponent(searchValue)}>
                <button className="gray-btn">
                  Ver más resultados
                </button>
              </Link>
            </div>
          </div>
      </div>
      </div>
  </div>
}

export default SearchSidebar