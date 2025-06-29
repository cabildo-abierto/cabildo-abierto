"use client"

import React from "react";
import {CloseButton} from "../../../modules/ui-utils/src/close-button";
import {TextField, TextFieldProps} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { Color } from "../../../modules/ui-utils/src/button";


const SearchBar = ({
    autoFocus=false,
    paddingY,
    fullWidth=true,
    searchValue,
    setSearchValue,
    setSearching=() => {},
    color="background-dark",
    borderColor="accent",
    placeholder="buscar",
    size="small"
}: {
    autoFocus?: boolean
    paddingY?: string
    fullWidth?: boolean
    searchValue: string
    setSearchValue: (arg: string) => void
    setSearching?: (v: boolean) => void
    color?: Color
    borderColor?: Color
    placeholder?: string
    size?: TextFieldProps["size"]
}) => {
    return <TextField
        size={size}
        autoFocus={autoFocus}
        fullWidth={fullWidth}
        value={searchValue}
        variant={"outlined"}
        placeholder={placeholder}
        onFocus={() => {setSearching(true)}}
        onChange={(e) => {setSearchValue(e.target.value)}}
        slotProps={{
            input: {
                startAdornment: <span className={"text-[var(--text-light)] mr-2"}><SearchIcon color={"inherit"}/></span>,
                endAdornment: searchValue && searchValue.length > 0 ? <CloseButton color="background-dark" size="small" onClose={() => {setSearchValue(""); setSearching(false)}}/> : undefined
            }
        }}
        autoComplete={"off"}
        sx={{
            "& .MuiOutlinedInput-root": {
                backgroundColor: `var(--${color})`,
                borderRadius: "8px",
                "& input": {
                    paddingY: paddingY,
                },
                "& fieldset": {
                    borderRadius: "8px",
                    borderColor: `var(--${borderColor})`,
                    borderWidth: "0px"
                },
                "&:hover fieldset": {
                    borderColor: `var(--${borderColor})`,
                },
                "&.Mui-focused fieldset": {
                    borderWidth: "2px",
                    borderColor: `var(--${borderColor})`,
                },
            }
        }}
    />
}

export default SearchBar;

