"use client"

import React, { useEffect, useState } from "react";
import { UserSearchResult } from "./searchbar";
import SelectionComponent from "./search-selection-component";
import { ContentWithComments } from "./content-with-comments";
import { searchContents, searchEntities, searchUsers } from "./search";
import { ContentProps } from "@/actions/get-content";
import { EntitySearchResult } from "./entity-search-result";


const SearchPage = ({searchValue}: any) => {
  const [resultsUsers, setResultsUsers] = useState<any[]>([]);
  const [resultsContents, setResultsContents] = useState<ContentProps[]>([]);
  const [resultsEntities, setResultsEntities] = useState<any[]>([]);
  const [searchType, setSearchType] = useState("users");

  useEffect(() => {
    const search = async (searchValue: string) => {
      setResultsUsers(await searchUsers(searchValue))
      setResultsContents(await searchContents(searchValue))
      setResultsEntities(await searchEntities(searchValue))
    }

    const delayDebounceFn = setTimeout(() => {
      search(searchValue);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchValue]);

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
      return resultsContents.map((content: ContentProps) => (
        <div className="py-2" key={content.id}>
          <ContentWithComments
            content={content}
          />
        </div>
      ))
    } else {
      return resultsEntities.map((result) => (
        <div className="flex justify-center" key={result.id}>
          <EntitySearchResult entity={result.entity} content={result.content}/>
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