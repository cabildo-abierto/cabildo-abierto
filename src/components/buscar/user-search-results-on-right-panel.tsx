import {Button} from "../../../modules/ui-utils/src/button";
import React from "react";
import { useSearch } from "./search-context";
import UserSearchResults from "@/components/buscar/user-search-results";


type Props = {
    showSearchButton: boolean
    handleSubmit: () => void
}

const UserSearchResultsOnRightPanel = ({showSearchButton, handleSubmit}: Props) => {
    const {searchState, setSearchState} = useSearch("main")

    function onClickResult(did: string) {
        setSearchState({value: "", searching: false})
    }

    return <div
        className={"w-full"}
    >
        {showSearchButton && (
            <div className={""}>
                <Button
                    onClick={handleSubmit}
                    variant={"outlined"}
                    color={"background-dark"}
                    sx={{
                        textTransform: "none",
                        width: "100%",
                        borderRadius: "0px"
                    }}
                    borderColor={"accent-dark"}
                >
                    <div className={"space-x-1 w-full"}>
                        <span>Buscar</span>
                        <span className={"text-[var(--text-light)]"}>
                            {searchState.value}
                        </span>
                    </div>
                </Button>
            </div>
        )}
        <UserSearchResults maxCount={6} searchState={searchState} onClickResult={onClickResult}/>
    </div>
}


export default UserSearchResultsOnRightPanel