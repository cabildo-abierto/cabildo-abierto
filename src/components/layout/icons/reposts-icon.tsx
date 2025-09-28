import RepeatIcon from '@mui/icons-material/Repeat';

export const RepostIcon = ({fontSize, color="var(--text-light)"}: {
    fontSize?: string | number, color?: string}) => {
    return <span style={{fontSize, color}} className={"flex items-center pb-[1px]"}><RepeatIcon
        fontSize={"inherit"}
        color={"inherit"}
    /></span>
}