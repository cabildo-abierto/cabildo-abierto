"use client"

import React from "react";
import {useSearch} from "./search-context";
import {CloseButton} from "../../../modules/ui-utils/src/close-button";
import {TextField} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";


const SearchBar = ({
    autoFocus=false,
    paddingY,
    fullWidth=true
}: {
    autoFocus?: boolean
    paddingY?: string
    fullWidth?: boolean
}) => {
    const {searchState, setSearchState} = useSearch()

    return <TextField
        size={"small"}
        autoFocus={autoFocus}
        fullWidth={fullWidth}
        value={searchState.value}
        variant={"outlined"}
        placeholder={"buscar"}
        onFocus={() => setSearchState({value: searchState.value, searching: true})}
        onChange={(e) => {setSearchState({value: e.target.value, searching: true});}}
        slotProps={{
            input: {
                startAdornment: <span className={"text-[var(--text-light)] mr-2"}><SearchIcon color={"inherit"}/></span>,
                endAdornment: searchState.value.length > 0 ? <CloseButton size="small" onClose={() => {setSearchState({value: "", searching: false})}}/> : undefined
            },
        }}
        autoComplete={"off"}
        sx={{
            "& .MuiOutlinedInput-root": {
                "& input": {
                    paddingY: paddingY
                },
                "& fieldset": {
                    borderRadius: "8px",
                    borderColor: "var(--accent)",
                },
                "&:hover fieldset": {
                    borderColor: "var(--accent)",
                },
                "&.Mui-focused fieldset": {
                    borderWidth: "2px",
                    borderColor: "var(--accent)",
                },
            }
        }}
    />
}

export default SearchBar;

