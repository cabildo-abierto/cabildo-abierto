import {Button} from "../layout/utils/button";
import {WriteButtonIcon} from "@/components/layout/icons/write-button-icon";


export const ReplyButton = ({
                                onClick,
                                text = "Responder",
    fullWidth = true
}: {
    onClick: () => void, text?: string, fullWidth?: boolean
}) => {
    return <Button
        color={"background"}
        onClick={onClick}
        variant={"text"}
        sx={{
            flexDirection: "row",
            justifyContent: "left",
            borderLeft: 0,
            borderRight: 0
        }}
        paddingX={"22px"}
        fullWidth={fullWidth}
        startIcon={<WriteButtonIcon/>}
        borderColor={"accent-dark"}
    >
        <span className="uppercase text-xs py-1">{text}</span>
    </Button>
}