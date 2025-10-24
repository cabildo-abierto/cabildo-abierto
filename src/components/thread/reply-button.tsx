import {Button} from "../layout/utils/button";
import {WriteButtonIcon} from "@/components/layout/icons/write-button-icon";
import { Color } from "../layout/utils/color";


export const ReplyButton = ({
                                onClick,
                                text = "Responder",
                                fullWidth = true,
    variant="text",
    color="background",
    size,
    borderLeftAndRight = 0
                            }: {
    onClick: () => void
    text?: string
    fullWidth?: boolean
    variant?: "text" | "outlined" | "contained"
    color?: Color
    size?: "small" | "medium" | "large"
    borderLeftAndRight?: number
}) => {
    return <Button
        color={color}
        onClick={onClick}
        variant={variant}
        sx={{
            flexDirection: "row",
            justifyContent: "left",
            borderLeft: borderLeftAndRight,
            borderRight: borderLeftAndRight
        }}
        size={size}
        paddingX={"22px"}
        fullWidth={fullWidth}
        startIcon={<WriteButtonIcon/>}
        borderColor={"accent-dark"}
    >
        <span className="uppercase text-xs py-1">{text}</span>
    </Button>
}