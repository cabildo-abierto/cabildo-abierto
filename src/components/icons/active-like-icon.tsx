import FavoriteIcon from '@mui/icons-material/Favorite';
import {FontSizeType} from "./icon-utils";

export const ActiveLikeIcon = ({fontSize}: {fontSize?: FontSizeType}) => {
    return <FavoriteIcon fontSize={fontSize}/>
}