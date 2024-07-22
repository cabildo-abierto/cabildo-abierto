"use client"

import React, { useEffect, useRef, useState } from "react";
import { UserProps } from "@/actions/get-user";
import { searchUsers, searchContents, searchEntities } from "@/actions/search";
import ContentComponent from "@/components/content";
import { useUser } from "./user-provider";
import { UserSearchResult } from "./searchbar";
import SelectionComponent from "./search-selection-component";
import Link from "next/link";

const SearchPage = ({searchValue}) => {
  const [resultsUsers, setResultsUsers] = useState<UserProps[]>([]);
  const [resultsContents, setResultsContents] = useState([]);
  const [resultsEntities, setResultsEntities] = useState([]);
  const [searchType, setSearchType] = useState("users");
  const {user} = useUser()

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      search();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchValue]);

  const search = async () => {
      setResultsUsers(await searchUsers(searchValue))
      setResultsContents(await searchContents(searchValue, user.id))
      setResultsEntities(await searchEntities(searchValue))
  }

  const handleTypeChange = (t) => {
    search()
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
      return resultsContents.map((result) => (
        <div className="py-2" key={result.content.id}>
          <ContentComponent
            content={result.content}
            comments={result.children}
            onViewComments={() => {}}
            onStartReply={() => {}}
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