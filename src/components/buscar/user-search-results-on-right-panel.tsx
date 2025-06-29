import {Button} from "../../../modules/ui-utils/src/button";
import React from "react";
import { useSearch } from "./search-context";
import dynamic from "next/dynamic";

const UserSearchResults = dynamic(() => import('@/components/buscar/user-search-results'));


type Props = {
    showSearchButton: boolean
    handleSubmit: () => void
}

const UserSearchResultsOnRightPanel = ({showSearchButton, handleSubmit}: Props) => {
    const {searchState, setSearchState} = useSearch()

    function onClickResult(did: string) {
        setSearchState({value: "", searching: false})
    }

    return <div
        className={"w-full max-w-[300px] mt-2"}
    >
        {showSearchButton && (
            <form onSubmit={handleSubmit}>
                <div className={""}>
                    <Button
                        onClick={handleSubmit}
                        variant={"text"}
                        color={"background-dark2"}
                        type="submit"
                        sx={{
                            textTransform: "none",
                            width: "100%",
                            borderRadius: "0px",
                            borderTopLeftRadius: "8px",
                            borderTopRightRadius: "8px",
                        }}
                    >
                        <div className={"space-x-1 w-full"}>
                            <span>Buscar</span>
                            <span className={"text-[var(--text-light)]"}>{searchState.value}</span>
                        </div>
                    </Button>
                </div>
            </form>
        )}
        <UserSearchResults maxCount={6} searchState={searchState} onClickResult={onClickResult}/>
    </div>
}


export default UserSearchResultsOnRightPanel