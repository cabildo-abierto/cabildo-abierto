import { useSearch } from "./search-context";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import React, { useEffect, useState } from "react";
import { get } from "@/utils/fetch";
import { ProfileViewBasic } from "@/lex-api/types/ar/cabildoabierto/actor/defs";
import SmallUserSearchResult from "@/components/buscar/small-user-search-result";
import UserSearchResult from "@/components/buscar/user-search-result";
import { useQuery } from "@tanstack/react-query";

async function searchUsers(query: string) {
    return (await get<ProfileViewBasic[]>("/search-users/" + encodeURIComponent(query))).data
}

const UserSearchResults = ({
                               maxCount,
                               showSearchButton = true,
                           }: {
    maxCount?: number;
    showSearchButton?: boolean;
}) => {
    const { searchState } = useSearch();
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
    });

    if (searchState.value.length == 0) {
        return (
            <div
                className={
                    "mt-8 text-center text-[var(--text-light)] " +
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
                    (showSearchButton ? "" : "mt-8")
                }
            >
                {error.message}
            </div>
        );
    }

    if (isLoading && !results) {
        return (
            <div
                className={
                    showSearchButton
                        ? "flex items-center bg-[var(--background-dark)] rounded-b-lg h-full w-full"
                        : "mt-8"
                }
            >
                <LoadingSpinner />
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
            <div className="flex flex-col justify-center w-full">
                {showSearchButton &&
                    results?.slice(0, rightIndex).map((user, index) => (
                        <div key={index} className="">
                            {showSearchButton ? (
                                <SmallUserSearchResult
                                    result={user}
                                    className={index == rightIndex - 1 ? " rounded-b-lg " : ""}
                                />
                            ) : (
                                <UserSearchResult user={user} />
                            )}
                        </div>
                    ))}

                {!showSearchButton && (
                    <>
                        {caResults.map((user, index) => (
                            <div key={index} className="">
                                {showSearchButton ? (
                                    <SmallUserSearchResult result={user} />
                                ) : (
                                    <UserSearchResult user={user} />
                                )}
                            </div>
                        ))}

                        {caResults.length == 0 && (
                            <div className={"py-16 text-center text-[var(--text-light)]"}>
                                No se encontró el usuario en Cabildo Abierto.
                            </div>
                        )}

                        <div className={"py-4 text-center text-[var(--text-light)] border-b"}>
                            Usuarios de Bluesky
                        </div>
                        {bskyResults.map((user, index) => (
                            <div key={index} className="">
                                {showSearchButton ? (
                                    <SmallUserSearchResult result={user} />
                                ) : (
                                    <UserSearchResult user={user} />
                                )}
                            </div>
                        ))}
                    </>
                )}

                {isLoading && (
                    <div className={"py-1 border-b"}>
                        <LoadingSpinner />
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserSearchResults;