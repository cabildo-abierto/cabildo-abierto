import { Button } from "../../../modules/ui-utils/src/button";
import {WriteButtonIcon} from "@/components/icons/write-button-icon";


export const ReplyButton = ({onClick, text = "Responder"}: { onClick: () => void, text?: string }) => {
    return <div className="py-1">
        <Button
            color={"transparent"}
            onClick={onClick}
            variant={"outlined"}
            sx={{
                flexDirection: "row",
                justifyContent: "left",
                border: "1px solid",
                borderRadius: 0
            }}
            borderColor={"text-lighter"}
            className="rounded-full bg-[var(--background-dark3)] w-full hover:bg-[var(--accent)] transition duration-200 flex items-center px-4 py-1 space-x-2"
        >
            <WriteButtonIcon/>
            <span className="uppercase text-xs">{text}</span>
        </Button>
    </div>
}