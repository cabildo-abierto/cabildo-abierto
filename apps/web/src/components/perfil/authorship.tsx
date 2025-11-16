import Link from "next/link";
import {profileUrl} from "@/components/utils/react/url";
import ValidationIcon from "./validation-icon";
import {ArCabildoabiertoActorDefs} from "@cabildo-abierto/api/dist"
import UserSummaryOnHover from "./user-summary";
import {getUsername} from "./utils";

export const Authorship = ({
                               author,
                               className = "hover:underline font-medium",
                               onlyAuthor = false,
                               text = "Por",
                               showIcon = true,
                               iconFontSize = 13
                           }: {
    className?: string,
    text?: string,
    author: ArCabildoabiertoActorDefs.ProfileViewBasic,
    onlyAuthor?: boolean
    iconFontSize?: number
    showIcon?: boolean
}) => {
    return <UserSummaryOnHover handle={author.handle}>
        <div className="flex space-x-1 items-center">
            {!onlyAuthor && <span>
            {text}
        </span>}
            <Link href={profileUrl(author.handle)} className={className} onClick={(e) => {
                e.stopPropagation()
            }}>
                {getUsername(author)}
            </Link>
            {showIcon && author.verification && <ValidationIcon
                fontSize={iconFontSize}
                handle={author.handle}
                verification={author.verification}
            />}
        </div>
    </UserSummaryOnHover>
}