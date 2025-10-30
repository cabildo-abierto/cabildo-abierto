import {Repeat2Icon} from "lucide-react";

export const RepostIcon = ({
                               fontSize,
                               weight = "light",
                               color = "var(--text-light)"
                           }: {
    fontSize?: string | number
    weight?: "light" | "bold"
    color?: string
}) => {
    return <Repeat2Icon
        strokeWidth={weight == "light" ? 1 : 1.5}
        size={fontSize}
        color={color}
    />
}