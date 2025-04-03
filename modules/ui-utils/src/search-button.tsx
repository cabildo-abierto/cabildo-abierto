import {IconButton} from "@/../modules/ui-utils/src/icon-button"
import SearchIcon from "@mui/icons-material/Search";

export const SearchButton = ({ onClick, disabled=false }: {onClick?: () => void, disabled?: boolean}) => {
    return <IconButton
        onClick={onClick}
        disabled={disabled}
        sx={{
            '&.Mui-disabled': {
                color: 'inherit', // Set the desired disabled color here
            }
        }}
        color="inherit"
        size="small"
    >
        <SearchIcon color={"inherit"}/>
    </IconButton>
}