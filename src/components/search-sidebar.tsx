import React from "react";
import SearchPage from "./search-page";
import Link from "next/link";

const SearchSidebar: React.FC<{searchValue: string}> = ({searchValue}) => {
  return <div className="fixed top-16 right-0 h-screen-minus-16 border-l">
      <div className="flex justify-end h-full bg-white">
        <div className="bg-white h-full flex flex-col justify-between" style={{width: "500px"}}>
          <div className="h-full overflow-scroll">
            <SearchPage searchValue={searchValue}/>
          </div>
          <div>
            <hr className="py-2"/>
            <div className="flex justify-center">
              <Link href={"/buscar/"+encodeURIComponent(searchValue)}>
                <button className="large-btn scale-btn">
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