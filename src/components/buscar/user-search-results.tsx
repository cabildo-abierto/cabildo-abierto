import {useSearch} from "./search-context"
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner"
import React, {useEffect, useState} from "react"
import {get} from "@/utils/fetch";
import {ProfileViewBasic} from "@/lex-api/types/ar/cabildoabierto/actor/defs";
import SmallUserSearchResult from "@/components/buscar/small-user-search-result";
import UserSearchResult from "@/components/buscar/user-search-result"


async function searchUsers(query: string) {
    return get<ProfileViewBasic[]>("/search-users/" + encodeURIComponent(query))
}


const UserSearchResults = ({maxCount, showSearchButton = true}: {
    maxCount?: number;
    showSearchButton?: boolean
}) => {
    const {searchState} = useSearch();
    const [resultsState, setResultsState] = useState<string>("not searching")
    const [results, setResults] = useState<ProfileViewBasic[] | null>(null);

    useEffect(() => {
        const debounceTimeout = setTimeout(async () => {
            setResults(null)
            if (searchState.value.length === 0) {
                setResultsState("not searching")
                return
            }
            setResultsState("searching")

            const {data: users, error} = await searchUsers(searchState.value)
            if (error) {
                setResultsState("atproto error: " + error)
                return
            }

            setResults(users)
            setResultsState("done")
        }, 300);


        return () => {
            clearTimeout(debounceTimeout);
        };
    }, [searchState.value]);

    if (searchState.value.length == 0) {
        return <div className={"mt-8 text-center text-[var(--text-light)] " + (showSearchButton ? " border-b " : "")}>
            Buscá un usuario
        </div>
    }

    if (resultsState.startsWith("atproto error: ")) {
        return <div className={"text-[var(--text-light)] text-center px-2 " + (showSearchButton ? "" : "mt-8")}>
            {resultsState.replace("atproto error: ", "")}
        </div>
    }

    if ((resultsState == "searching" && !results) || !results) {
        return <div
            className={showSearchButton ? "flex items-center bg-[var(--background-dark)] rounded-b-lg h-full w-full" : "mt-8"}>
            <LoadingSpinner/>
        </div>
    }

    if (results && resultsState != "searching" && results.length == 0) {
        return <div className={"text-[var(--text-light)] border-b text-center " + (showSearchButton ? "py-4" : "")}>
            No se encontraron resultados
        </div>
    }

    const rightIndex = maxCount != undefined ? maxCount : results.length

    const caResults = results.filter(r => r.caProfile != null)
    const bskyResults = results.filter(r => !r.caProfile)

    return <div className="flex flex-col items-center">
        <div className="flex flex-col justify-center w-full">
            {showSearchButton && results.slice(0, rightIndex).map((user, index) => (
                <div key={index} className="">
                    {showSearchButton ? <SmallUserSearchResult
                            result={user}
                            className={index == rightIndex - 1 ? " rounded-b-lg " : ""}
                        /> :
                        <UserSearchResult user={user}/>}
                </div>
            ))}

            {!showSearchButton && <>
                {caResults.map((user, index) => (
                    <div key={index} className="">
                        {showSearchButton ? <SmallUserSearchResult result={user}/> : <UserSearchResult user={user}/>}
                    </div>
                ))}

                {caResults.length == 0 &&
                    <div className={"py-16 text-center text-[var(--text-light)]"}>No se encontró el usuario en Cabildo
                        Abierto.</div>}

                <div className={"py-4 text-center text-[var(--text-light)] border-b"}>
                    Usuarios de Bluesky
                </div>
                {bskyResults.map((user, index) => (
                    <div key={index} className="">
                        {showSearchButton ? <SmallUserSearchResult result={user}/> : <UserSearchResult user={user}/>}
                    </div>
                ))}
            </>}

            {resultsState == "searching" && results.length < rightIndex && <div className={"py-1 border-b"}>
                <LoadingSpinner/>
            </div>}
        </div>
    </div>
}


export default UserSearchResults