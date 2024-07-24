"use client"

import React, { useEffect, useState } from "react";
import { EntitySearchResult, UserSearchResult } from "./searchbar";
import SelectionComponent from "./search-selection-component";
import { useContents } from "./use-contents";
import { ContentWithComments } from "./content-with-comments";
import { searchContents, searchEntities, searchUsers } from "./search";
import { useUsers } from "./use-users";
import { useEntities } from "./use-entities";


const SearchPage = ({searchValue}: any) => {
  const {contents, setContents} = useContents()
  const {entities, setEntities} = useEntities()
  const {users, setUsers} = useUsers()

  const [resultsUsers, setResultsUsers] = useState<{id: string}[]>([]);
  const [resultsContents, setResultsContents] = useState<{id: string}[]>([]);
  const [resultsEntities, setResultsEntities] = useState<{id: string}[]>([]);
  const [searchType, setSearchType] = useState("users");

  useEffect(() => {
    const search = async (searchValue: string) => {
      if(users) setResultsUsers(searchUsers(searchValue, Object.values(users)))
      if(contents) setResultsContents(searchContents(searchValue, Object.values(contents)))
      if(entities) setResultsEntities(searchEntities(searchValue, Object.values(entities)))
    }

    const delayDebounceFn = setTimeout(() => {
      search(searchValue);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchValue, contents, entities, users]);

  const handleTypeChange = (t: any) => {
    setSearchType(t)
  }

  const searchResults = () => {
    if (searchType == "users") {
      return resultsUsers.map((result) => (
        <div className="flex justify-center" key={result.id}>
          <UserSearchResult result={result}/>
        </div>
      ))
    } else if (searchType == "contents") {
      if(!contents) return <></>
      return resultsContents.map((result: {id: string}) => (
        <div className="py-2" key={result.id}>
          <ContentWithComments
            content={contents[result.id]}
          />
        </div>
      ))
    } else {
      return resultsEntities.map((result) => (
        <div className="flex justify-center" key={result.id}>
          <EntitySearchResult result={result}/>
        </div>
      ))
    }
  }

  return <>
      <div className="flex justify-center">
          <SelectionComponent selectionHandler={handleTypeChange} />
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