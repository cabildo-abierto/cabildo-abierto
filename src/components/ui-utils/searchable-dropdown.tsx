"use client"
import React, {ReactNode, useEffect, useState} from 'react';
import {TextField, Paper, List, ListItem, ListItemText, MenuItem} from '@mui/material';

interface SearchableDropdownProps {
  options: string[]
  optionViews?: ReactNode[]
  onSelect: (value: string) => void
  label: string
  size: "small" | "medium"
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({ options, optionViews, label, onSelect, size }) => {
  const [searchText, setSearchText] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const filtered = options.filter((option) =>
        option.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredOptions(filtered)
  }, [options])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchText(value);

    const filtered = options.filter((option) =>
        option.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredOptions(filtered);
    setShowDropdown(filtered.length > 0);
  };

  const handleOptionSelect = (option: string) => {
    setSearchText(option);
    setShowDropdown(false);
    onSelect(option);
  };

  return (
      <div className="relative w-full max-w-md mx-auto">
        <TextField
            size={size}
            variant="outlined"
            fullWidth
            value={searchText}
            onChange={handleInputChange}
            onFocus={() => setShowDropdown(filteredOptions.length > 0)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
            label={label}
            InputProps={{autoComplete: "off"}}
        />
        {showDropdown && (
            <Paper className="absolute z-10 mt-1 min-w-full max-w-max">
              <List>
                {filteredOptions.map((option, index) => (
                    <MenuItem
                        key={index}
                        onClick={() => handleOptionSelect(option)}
                        className="cursor-pointer hover:bg-[var(--background-dark)]"
                        component="div"
                    >
                      {optionViews == null ? <span className={"text-sm"}>{option}</span> : optionViews[index]}
                    </MenuItem>
                ))}
              </List>
            </Paper>
        )}
      </div>
  );
};

export default SearchableDropdown;
