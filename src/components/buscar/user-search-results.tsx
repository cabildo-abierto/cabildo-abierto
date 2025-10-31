import LoadingSpinner from "../layout/base/loading-spinner";
import React from "react";
import SmallUserSearchResult from "@/components/buscar/small-user-search-result";
import UserSearchResult from "@/components/buscar/user-search-result";
import {useQuery} from "@tanstack/react-query";
import { useDebounce } from "@/utils/debounce";
import {searchUsers} from "@/components/writing/query-mentions";


export const useSearchUsers = (
    searchState: {value: string, searching: boolean},
    limit: number) => {
    const debouncedQuery = useDebounce(searchState.value, 300)

    const {
        data: results,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["user-search", debouncedQuery],
        queryFn: () => searchUsers(debouncedQuery, limit),
        enabled: debouncedQuery.length > 0,
        select: (data) => data,
    })

    return {results, isLoading: isLoading || debouncedQuery != searchState.value, isError, error}
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
    const {results, isLoading, isError} = useSearchUsers(searchState, showSearchButton ? 6 : 25)

    if (searchState.value.length == 0) {
        return (
            <div
                className={
                    "my-16 text-center text-[var(--text-light)] font-light " +
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

    if (isLoading) {
        return (
            <div
                className={
                    showSearchButton
                        ? "flex items-center border-[var(--accent-dark)] border-b border-l border-r h-full w-full"
                        : "mt-32"
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
                    "text-[var(--text-light)] text-sm font-light text-center " +
                    (showSearchButton ? "py-4 border-b text-sm border-l border-r border-[var(--accent-dark)]" : "py-16")
                }
            >
                No se encontraron usuarios.
            </div>
        );
    }

    const rightIndex = maxCount != undefined ? maxCount : results?.length || 0;

    const caResults = results?.filter((r) => r.caProfile != null) || [];
    const bskyResults = results?.filter((r) => !r.caProfile) || [];

    return (
        <div className="flex flex-col items-center bg-[var(--backgound)]">
            <div className={"flex flex-col justify-center w-full " + (showSearchButton ? "border-l border-r border-b border-[var(--accent-dark)]" : "")}>
                {showSearchButton &&
                    results?.slice(0, rightIndex).map((user, index) => (
                        <div key={index} className="">
                            {showSearchButton ? (
                                <SmallUserSearchResult
                                    user={user}
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
                                        user={user}
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
                            <div className={"py-16 text-center text-[var(--text-light)] font-light"}>
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
                                        user={user}
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