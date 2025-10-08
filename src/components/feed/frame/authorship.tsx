import Link from "next/link";
import {profileUrl} from "@/utils/uri";
import {getUsername} from "@/utils/utils";
import ValidationIcon from "@/components/profile/validation-icon";
import {ArCabildoabiertoActorDefs} from "@/lex-api/index"

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
    return <div className="flex space-x-1 items-center">
        {!onlyAuthor && <span>
            {text}
        </span>}
        <Link href={profileUrl(author.handle)} className={className} onClick={(e) => {
            e.stopPropagation()
        }}>
            {getUsername(author)}
        </Link>
        {showIcon && <ValidationIcon
            fontSize={iconFontSize}
            handle={author.handle}
            verification={author.verification}
        />}
    </div>
}