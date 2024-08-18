import React from "react";
import SearchPage from "./search-page";
import Link from "next/link";


const SearchSidebar: React.FC<{searchValue: string}> = (
  {searchValue}) => {
  
  return <div className="search-sidebar">
  <div className="flex justify-end h-full w-full">
      <div className="h-full flex flex-col justify-between w-screen w-full">
        <div className="h-full overflow-scroll">
          <SearchPage searchValue={searchValue}/>
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