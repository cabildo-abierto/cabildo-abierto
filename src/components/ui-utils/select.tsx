import React from 'react';
import { Select as MUISelect, MenuItem, FormControl, InputLabel } from '@mui/material';

export const Select = ({ options, value, onChange, label, firstDisabled=false }: { firstDisabled?: boolean, options: string[], onChange: (v: string) => void, value: string, label?: string }) => {
    const selectId = label ? `select-${label}` : 'select';
    return (
        <FormControl fullWidth variant="outlined">
            {label && <InputLabel id={selectId}>{label}</InputLabel>}
            <MUISelect
                value={value}
                onChange={(e) => onChange(e.target.value)}
                label={label}
                size={"small"}
                labelId={selectId}
                fullWidth
            >
                {options.map((o, i) => (
                    <MenuItem
                        key={i} value={o}>
                        {o}
                    </MenuItem>
                ))}
            </MUISelect>
        </FormControl>
    );
};
