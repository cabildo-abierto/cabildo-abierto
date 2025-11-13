import {useAPI} from "@/queries/utils";
import LoadingSpinner from "@/components/layout/base/loading-spinner";
import {Note} from "@/components/layout/utils/note";
import {BaseButton} from "@/components/layout/base/baseButton";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {post} from "@/utils/fetch";
import {produce} from "immer";
import React, {useState} from "react";
import SearchBar from "@/components/buscar/search-bar";
import {cleanText} from "@/utils/strings";

export type UserInterest = {
    id: string
    selected: boolean
}

function useInterests() {
    return useAPI<UserInterest[]>("/interests", ["interests"])
}


async function selectInterest(interestId: string) {
    return await post<{}, {}>(`/interest/${encodeURIComponent(interestId)}`)
}


async function removeInterest(interestId: string) {
    return await post<{}, {}>(`/remove-interest/${encodeURIComponent(interestId)}`)
}


export const DiscoverFeedConfig = () => {
    const {data, isLoading} = useInterests()
    const qc = useQueryClient()
    const [viewingCount, setViewingCount] = useState<number>(12)
    const [categorySearch, setCategorySearch] = useState("")

    const selectInterestMutation = useMutation({
        mutationFn: selectInterest,
        onMutate: (i) => {
            qc.setQueryData(["interests"], data => {
                const interests = data as UserInterest[]
                return produce(interests, draft => {
                    const idx = draft.findIndex(x => x.id == i)
                    if (idx != -1) {
                        draft[idx].selected = true
                    }
                })
            })
        },
        onSettled: (s) => {
        }
    })

    const removeInterestMutation = useMutation({
        mutationFn: removeInterest,
        onMutate: (i) => {
            qc.setQueryData(["interests"], data => {
                const interests = data as UserInterest[]
                return produce(interests, draft => {
                    const idx = draft.findIndex(x => x.id == i)
                    if (idx != -1) {
                        draft[idx].selected = false
                    }
                })
            })
        },
        onSettled: (s) => {
        }
    })


    if (isLoading) {
        return <div className={"py-4"}>
            <LoadingSpinner/>
        </div>
    }

    if (!data) {
        return <Note>
            Ocurrió un error al cargar los intereses.
        </Note>
    }

    function onClickInterest(id: string) {
        const cur = data.find(x => x.id == id)
        if (!cur) return
        if (!cur.selected) {
            selectInterestMutation.mutate(id)
        } else {
            removeInterestMutation.mutate(id)
        }
    }

    function cmp(a: UserInterest, b: UserInterest) {
        return (a.selected ? 1 : 0) > (b.selected ? 1 : 0) ? -1 : 1
    }

    const filteredCategories = data
        .toSorted(cmp)
        .filter(x => {
            return cleanText(x.id).includes(cleanText(categorySearch))
        })

    return <div className={"space-y-2"}>
        <Note className={"text-left"}>
            Intereses
        </Note>

        <div className={"flex flex-wrap gap-1 group portal"}>
            <SearchBar
                className={"w-[144px] mr-1"}
                inputClassName={"py-[3px] text-[12px]"}
                inputGroupClassName={""}
                autoComplete={"off"}
                searchValue={categorySearch}
                setSearchValue={(e) => {
                    setCategorySearch(e)
                }}
                placeholder={"Buscar..."}
            />
            {filteredCategories.slice(0, viewingCount).map(i => {
                return <BaseButton
                    onClick={() => {
                        onClickInterest(i.id)
                    }}
                    size={"small"}
                    variant={i.selected ? "outlined" : "default"}
                    key={i.id}
                    className={"text-xs px-1 py-1"}
                >
                    {i.id}
                </BaseButton>
            })}
            {viewingCount < filteredCategories.length && <BaseButton
                className={"text-xs px-1 py-1 underline"}
                onClick={() => {
                    setViewingCount(viewingCount + 10)
                }}
            >
                Ver más
            </BaseButton>}
        </div>
    </div>
}