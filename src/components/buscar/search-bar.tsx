"use client"

import React from "react";
import {CloseButton} from "../../../modules/ui-utils/src/close-button";
import {TextField, TextFieldProps} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import {Color} from "../../../modules/ui-utils/src/color";


const SearchBar = ({
    autoFocus=false,
    paddingY,
    fullWidth=true,
    searchValue,
    setSearchValue,
    setSearching=() => {},
    color="background",
    borderColor="accent-dark",
    placeholder="buscar",
    size="small",
    borderRadius="0",
    borderWidth="1px",
    borderWidthNoFocus="1px",
    searching
}: {
    autoFocus?: boolean
    paddingY?: string
    fullWidth?: boolean
    searchValue: string
    searching?: boolean
    setSearchValue: (arg: string) => void
    setSearching?: (v: boolean) => void
    color?: Color
    borderColor?: Color
    borderRadius?: string
    borderWidth?: string
    borderWidthNoFocus?: string
    placeholder?: string
    size?: TextFieldProps["size"]
}) => {

    const showCloseButton = searching && searchValue && searchValue.length > 0

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
                endAdornment: showCloseButton ? <CloseButton color={color} size="small" onClose={() => {setSearchValue(""); setSearching(false)}}/> : undefined
            }
        }}
        autoComplete={"off"}
        sx={{
            "& .MuiOutlinedInput-root": {
                backgroundColor: `var(--${color})`,
                borderRadius,
                borderColor: `var(--${borderColor})`,
                paddingRight: "4px",
                paddingLeft: "8px",
                "& input": {
                    paddingY: paddingY
                },
                "& fieldset": {
                    borderRadius,
                    borderColor: `var(--${borderColor})`,
                    borderWidth: borderWidthNoFocus
                },
                "&:hover fieldset": {
                    borderColor: `var(--${borderColor})`,
                },
                "&.Mui-focused fieldset": {
                    borderWidth,
                    borderColor: `var(--${borderColor})`,
                },
            }
        }}
    />
}

export default SearchBar;

