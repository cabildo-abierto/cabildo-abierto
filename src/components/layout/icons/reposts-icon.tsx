import RepeatIcon from '@mui/icons-material/Repeat';
import { Color } from '../../../../modules/ui-utils/src/color';

export const RepostIcon = ({fontSize, color = "text-light"}: {
    fontSize?: string | number
    color?: Color
}) => {
    return <span style={{fontSize, color: `var(--${color})`}} className={"flex items-center pb-[1px]"}>
        <RepeatIcon
            fontSize={"inherit"}
            color={"inherit"}
        />
    </span>
}