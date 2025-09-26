import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import React, {useEffect, useState} from "react";
import {get} from "@/utils/fetch";
import SmallUserSearchResult from "@/components/buscar/small-user-search-result";
import UserSearchResult from "@/components/buscar/user-search-result";
import {useQuery} from "@tanstack/react-query";
import {ArCabildoabiertoActorDefs} from "@/lex-api/index"

async function searchUsers(query: string) {
    if(encodeURIComponent(query).trim().length > 0){
        return (await get<ArCabildoabiertoActorDefs.ProfileViewBasic[]>("/search-users/" + encodeURIComponent(query))).data
    } else {
        return []
    }
}


export const useSearchUsers = (searchState: {value: string, searching: boolean}) => {
    const [debouncedQuery, setDebouncedQuery] = useState("");

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            setDebouncedQuery(searchState.value);
        }, 300);

        return () => {
            clearTimeout(debounceTimeout);
        };
    }, [searchState.value]);

    const {
        data: results,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["user-search", debouncedQuery],
        queryFn: () => searchUsers(debouncedQuery),
        enabled: debouncedQuery.length > 0,
        select: (data) => data,
    })

    return {results, isLoading, isError, error}
}


const UserSearchResults = ({
                               maxCount,
                               showSearchButton = true,
                               searchState,
                               onClickResult,
                               goToProfile = true,
                               showFollowButton = true,
                               splitBluesky = true
                           }: {
    searchState: { value: string, searching: boolean }
    maxCount?: number
    showSearchButton?: boolean
    onClickResult?: (did: string) => (Promise<void> | void)
    showFollowButton?: boolean
    splitBluesky?: boolean
    goToProfile?: boolean
}) => {
    const {results, isLoading, isError} = useSearchUsers(searchState)

    if (searchState.value.length == 0) {
        return (
            <div
                className={
                    "my-8 text-center text-[var(--text-light)] font-light " +
                    (showSearchButton ? " border-b " : "")
                }
            >
                Buscá un usuario
            </div>
        );
    }

    if (isError) {
        return (
            <div
                className={
                    "text-[var(--text-light)] text-center px-2 " +
                    (showSearchButton ? "mt-2" : "mt-8")
                }
            >
                Ocurrió un error al buscar
            </div>
        );
    }

    if (isLoading && !results) {
        return (
            <div
                className={
                    showSearchButton
                        ? "flex items-center border-b border-l border-r border-[var(--text-lighter)] h-full w-full"
                        : "my-8"
                }
            >
                <LoadingSpinner/>
            </div>
        );
    }

    if (results && results.length == 0) {
        return (
            <div
                className={
                    "text-[var(--text-light)] text-center " +
                    (showSearchButton ? "py-4 border-b" : "py-16")
                }
            >
                No se encontraron resultados
            </div>
        );
    }

    const rightIndex = maxCount != undefined ? maxCount : results?.length || 0;

    const caResults = results?.filter((r) => r.caProfile != null) || [];
    const bskyResults = results?.filter((r) => !r.caProfile) || [];

    return (
        <div className="flex flex-col items-center">
            <div className={"flex flex-col justify-center w-full " + (showSearchButton ? "border-l border-r border-b border-[var(--text-lighter)]" : "")}>
                {showSearchButton &&
                    results?.slice(0, rightIndex).map((user, index) => (
                        <div key={index} className="">
                            {showSearchButton ? (
                                <SmallUserSearchResult
                                    result={user}
                                    className={index == rightIndex - 1 ? " rounded-b-lg " : ""}
                                    onClick={onClickResult}
                                />
                            ) : (
                                <UserSearchResult
                                    user={user}
                                    showFollowButton={showFollowButton}
                                    goToProfile={goToProfile}
                                    onClick={onClickResult}
                                />
                            )}
                        </div>
                    ))}

                {!showSearchButton && (
                    <>
                        {caResults.map((user, index) => (
                            <div key={index} className="">
                                {showSearchButton ? (
                                    <SmallUserSearchResult
                                        result={user}
                                        onClick={onClickResult}
                                    />
                                ) : (
                                    <UserSearchResult
                                        user={user}
                                        showFollowButton={showFollowButton}
                                        goToProfile={goToProfile}
                                        onClick={onClickResult}
                                    />
                                )}
                            </div>
                        ))}

                        {caResults.length == 0 && splitBluesky && (
                            <div className={"py-16 text-center text-[var(--text-light)]"}>
                                No se encontró el usuario en Cabildo Abierto.
                            </div>
                        )}

                        {splitBluesky && <div className={"uppercase text-[13px] py-4 text-center text-[var(--text-light)] border-b"}>
                            Usuarios de Bluesky
                        </div>}
                        {bskyResults.map((user, index) => (
                            <div key={index} className="">
                                {showSearchButton ? (
                                    <SmallUserSearchResult
                                        result={user}
                                        onClick={onClickResult}
                                    />
                                ) : (
                                    <UserSearchResult
                                        user={user}
                                        showFollowButton={showFollowButton}
                                        goToProfile={goToProfile}
                                        onClick={onClickResult}
                                    />
                                )}
                            </div>
                        ))}
                    </>
                )}

                {isLoading && (
                    <div className={"py-1 border-b"}>
                        <LoadingSpinner/>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserSearchResults;