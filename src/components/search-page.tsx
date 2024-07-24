"use client"

import React, { useEffect, useState } from "react";
import { UserProps } from "@/actions/get-user";
import { searchUsers, searchContents, searchEntities } from "@/actions/search";
import ContentComponent from "@/components/content";
import { UserSearchResult } from "./searchbar";
import SelectionComponent from "./search-selection-component";
import { useContents } from "./use-contents";
import { ContentWithComments } from "./content-with-comments";


const SearchPage = ({searchValue}: any) => {
  const {contents, setContents} = useContents()
  const [resultsUsers, setResultsUsers] = useState<UserProps[]>([]);
  const [resultsContents, setResultsContents] = useState<{id: string}[]>([]);
  const [resultsEntities, setResultsEntities] = useState<any[]>([]);
  const [searchType, setSearchType] = useState("users");

  useEffect(() => {
    const search = async (searchValue: string) => {
      setResultsUsers(await searchUsers(searchValue))
      if(contents) setResultsContents(await searchContents(searchValue, contents))
      setResultsEntities(await searchEntities(searchValue))
    }

    const delayDebounceFn = setTimeout(() => {
      search(searchValue);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchValue, contents]);

  const handleTypeChange = (t: any) => {
    setSearchType(t)
  }

  const searchResults = () => {
    if (searchType == "users") {
      return resultsUsers.map((result) => (
        <div className="flex justify-center" key={result.id}>
          <UserSearchResult result={result} isEntity={false} />
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
          <UserSearchResult result={result} isEntity={true} />
        </div>
      ))
    }
  }

  return <div className="w-full flex flex-col justify-between">
      <div className="flex justify-center">
          <SelectionComponent selectionHandler={handleTypeChange} />
      </div>
      <div className="flex justify-center h-full overflow-scroll">
          <div className="mt-4 w-full px-8">
              <div className="w-full">
                  {searchResults()}
              </div>
          </div>
      </div>
  </div>
}

export default SearchPage