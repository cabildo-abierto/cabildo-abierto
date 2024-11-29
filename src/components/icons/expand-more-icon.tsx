
import ExpandMoreIconMui from '@mui/icons-material/ExpandMore';
import { FontSizeType } from './icon-utils';

export const ExpandMoreIcon = ({fontSize="inherit"}: {fontSize?: FontSizeType}) => {
    return <ExpandMoreIconMui fontSize={fontSize}/>
}