"use client"

import React from "react";
import {CloseButton} from "./close-button";
import {BaseTextField, BaseTextFieldProps} from "@/components/utils/base/base-text-field";
import SearchIcon from "@/components/utils/icons/search-icon";

type Props = BaseTextFieldProps & {
    searchValue: string
    searching?: boolean
    setSearchValue: (arg: string) => void
    setSearching?: (v: boolean) => void
    allowCloseWithNoText?: boolean
}

export const SearchBar = ({
                       autoFocus = false,
                       searchValue,
                       setSearchValue,
                       setSearching = () => {
                       },
                       placeholder = "buscar",
                       searching,
                       allowCloseWithNoText = false,
                       ...props
                   }: Props) => {

    const showCloseButton = searching && searchValue != null && (allowCloseWithNoText || searchValue.length > 0)

    const endIcon = showCloseButton ? <CloseButton
        size="small"
        onClose={() => {
        setSearchValue("");
        setSearching(false)
        }}
        className={"text-[var(--text)]"}
    /> : undefined

    return <BaseTextField
        {...props}
        placeholder={placeholder}
        value={searchValue}
        onFocus={() => {
            setSearching(true)
        }}
        onChange={(e) => {
            setSearchValue(e.target.value)
        }}
        startIcon={<span className={"text-[var(--text-light)]"}><SearchIcon/></span>}
        endIcon={endIcon}
    />
}