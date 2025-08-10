"use client"
import React, {ReactNode, useEffect, useState} from 'react';
import {TextField, Paper, List, MenuItem} from '@mui/material';
import LoadingSpinner from "./loading-spinner";

interface SearchableDropdownProps {
    options: string[] | "loading" | null
    optionViews?: ReactNode[]
    onSelect?: (value: string) => void
    onChange: (value: string) => void
    label?: string
    size: "small" | "medium"
    selected?: string
    fontSize?: string
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
                                                                   fontSize = "0.875rem",
                                                                   selected = "",
                                                                   onSelect = () => {
                                                                   },
                                                                   options,
                                                                   optionViews,
                                                                   label,
                                                                   size,
                                                                   onChange
                                                               }) => {
    const [filteredOptions, setFilteredOptions] = useState(options != null && options != "loading" ? options : null);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        if (options != null && options != "loading") {
            const filtered = options.filter((option) =>
                option.toLowerCase().includes(selected.toLowerCase())
            );
            setFilteredOptions(filtered)
        }
    }, [options, selected])

    const handleOptionSelect = (option: string) => {
        onSelect(option)
        onChange(option)
        setShowDropdown(false)
    }

    return (
        <div className="relative mx-auto w-full">
            <TextField
                size={size}
                variant="outlined"
                fullWidth
                value={selected}
                onChange={(e) => {
                    onChange(e.target.value)
                }}
                onFocus={() => setShowDropdown(!options || filteredOptions.length > 0)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
                label={label}
                InputProps={{
                    autoComplete: "off",
                    sx: {
                        fontSize
                    }
                }}
                InputLabelProps={{
                    sx: {fontSize}
                }}
            />
            {showDropdown && filteredOptions != null && (!filteredOptions || (filteredOptions && filteredOptions.length > 0)) && (
                <Paper className="absolute z-10 mt-1 min-w-full max-w-max">
                    <List>
                        {filteredOptions && filteredOptions.map((option, index) => (
                            <MenuItem
                                key={index}
                                onClick={() => {
                                    handleOptionSelect(option)
                                }}
                                className="cursor-pointer hover:bg-[var(--background-dark)]"
                                component="div"
                            >
                                {optionViews == null ? <span className={"text-sm"}>{option}</span> : optionViews[index]}
                            </MenuItem>
                        ))}
                        {options == "loading" && <div className={"py-4"}><LoadingSpinner/></div>}
                    </List>
                </Paper>
            )}
        </div>
    );
};

export default SearchableDropdown;
