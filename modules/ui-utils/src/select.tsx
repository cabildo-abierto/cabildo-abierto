import React from 'react';
import { Select as MUISelect, MenuItem, FormControl, InputLabel } from '@mui/material';

export const Select = ({
       options, value, onChange, label, fontSize, labelShrinkFontSize }: {
    options: string[]
    onChange: (v: string) => void
    value: string
    label?: string
    fontSize?: string
    labelShrinkFontSize?: string
}) => {
    const selectId = label ? `select-${label}` : 'select';

    return (
        <FormControl fullWidth variant="outlined" size="small">
            {label && <InputLabel
                id={selectId}
                sx={{
                    fontSize: fontSize,
                    "&.MuiInputLabel-shrink": { fontSize: labelShrinkFontSize }
                }}
            >{label}
            </InputLabel>}
            <MUISelect
                value={value}
                onChange={(e) => onChange(e.target.value)}
                label={label}
                labelId={selectId}
                fullWidth
                sx={{
                    fontSize: fontSize,
                    backgroundColor: "var(--background-dark)"
                }}
                MenuProps={{
                    PaperProps: {
                        sx: {
                            backgroundColor: "var(--background-dark)",
                            paddingTop: 0,
                            marginTop: "2px",
                            paddingBottom: 0,
                            boxShadow: "none", // Removes the shadow
                            borderWidth: "1px"
                        },
                        elevation: 0 // Also ensures no elevation shadow
                    }
                }}
            >
                {options.map((o, i) => (
                    <MenuItem
                        key={i}
                        value={o}
                        sx={{
                            backgroundColor: "var(--background-dark)",
                            '&.Mui-selected': {
                                backgroundColor: "var(--background-dark)",
                            },
                            '&.Mui-selected:hover': {
                                backgroundColor: "var(--background-dark2)",
                            },
                            '&:hover': {
                                backgroundColor: "var(--background-dark2)",
                            }
                        }}
                    >
                        {o}
                    </MenuItem>
                ))}
            </MUISelect>

        </FormControl>
    );
};
