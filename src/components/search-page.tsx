"use client"

import React, { useEffect, useState } from "react";
import { UserSearchResult } from "./searchbar";
import SelectionComponent from "./search-selection-component";
import { searchContents, searchEntities, searchUsers } from "./search";
import { EntitySearchResult } from "./entity-search-result";
import ContentComponent from "./content";
import { useEntities } from "@/app/hooks/entities";
import { useFeed } from "@/app/hooks/contents";
import { useUsers } from "@/app/hooks/user";
import { SmallEntityProps } from "@/app/lib/definitions";


const SearchPage = ({searchValue}: {searchValue: string}) => {
  const [resultsUsers, setResultsUsers] = useState<any[]>([]);
  const [resultsContents, setResultsContents] = useState<{id: string}[]>([]);
  const [resultsEntities, setResultsEntities] = useState<{id: string, name: string}[]>([]);
  const [searchType, setSearchType] = useState("Usuarios");

  const entities = useEntities()
  const contents = useFeed()
  const users = useUsers()

  useEffect(() => {
    const search = async (searchValue: string) => {
      if(!users.isLoading && users.users)
        setResultsUsers(searchUsers(searchValue, users.users))
      if(!contents.isLoading)
      setResultsContents(searchContents(searchValue, contents.feed))
      if(!entities.isLoading)
        setResultsEntities(searchEntities(searchValue, entities.entities))
    }

    const delayDebounceFn = setTimeout(() => {
      search(searchValue);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchValue, users.isLoading, contents.isLoading, entities.isLoading]);

  const handleTypeChange = (t: any) => {
    setSearchType(t)
  }

  const searchResults = () => {
    if (searchType == "Usuarios") {
      return resultsUsers.map((result) => (
        <div className="flex justify-center" key={result.id}>
          <UserSearchResult result={result}/>
        </div>
      ))
    } else if (searchType == "Publicaciones") {
      return resultsContents.map(({id}) => (
        <div className="py-2" key={id}>
          <ContentComponent
            contentId={id}
            onViewComments={() => {}}
            onStartReply={() => {}}
            viewingComments={false}
          />
        </div>
      ))
    } else {
      return resultsEntities.map((entity) => (
        <div className="flex justify-center" key={entity.id}>
          <EntitySearchResult entity={entity}/>
        </div>
      ))
    }
  }

  return <>
      <div className="flex justify-center w-full">
          <SelectionComponent onSelection={handleTypeChange} options={["Usuarios", "Publicaciones", "Artículos colaborativos"]}/>
      </div>
      <div className="flex justify-center overflow-scroll">
          <div className="mt-4 w-full px-8">
              <div className="w-full">
                  {searchResults()}
              </div>
          </div>
      </div>
  </>
}

export default SearchPage