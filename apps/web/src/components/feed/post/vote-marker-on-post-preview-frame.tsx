import {CheckIcon, XIcon} from '@phosphor-icons/react';
import {DescriptionOnHover} from "@/components/utils/base/description-on-hover";
import {ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api"


export const VoteMarkerOnPostPreviewFrame = ({postView}: {
    postView: ArCabildoabiertoFeedDefs.PostView
}) => {
    return <>
        {postView.voteContext?.authorVotingState == "accept" && <DescriptionOnHover description={`@${postView.author.handle} votó a favor de esta versión del tema.`}>
            <div className={"absolute top-0 right-0 bg-[var(--green-dark2)] text-[var(--text-light)] rounded-full items-center p-[2px]"}>
                <CheckIcon fontSize={12}/>
            </div>
        </DescriptionOnHover>}
        {postView.voteContext?.authorVotingState == "reject" && <DescriptionOnHover description={`@${postView.author.handle} votó en contra de esta versión del tema.`}>
            <div className={"absolute top-0 right-0 bg-[var(--red-dark2)] text-[var(--text-light)] rounded-full items-center p-[2px]"}>
                <XIcon fontSize={12}/>
            </div>
        </DescriptionOnHover>}
    </>
}