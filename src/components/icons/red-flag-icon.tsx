import FlagIcon from '@mui/icons-material/Flag';
import { FontSizeType } from './icon-utils';

export const RedFlag = ({fontSize = "inherit"}: {fontSize?: FontSizeType}) => {
    return <FlagIcon fontSize={fontSize} className="text-red-600"/>
}