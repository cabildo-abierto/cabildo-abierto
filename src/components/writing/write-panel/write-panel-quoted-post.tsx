import {PostRecordEmbed} from "@/components/feed/embed/post-record-embed";
import {ArCabildoabiertoEmbedRecord} from "@/lex-api/index"


export const WritePanelQuotedPost = ({quotedPost}: {
    quotedPost: ArCabildoabiertoEmbedRecord.View["record"]
}) => {
    const embed: ArCabildoabiertoEmbedRecord.View = {
        $type: "ar.cabildoabierto.embed.record#view",
        record: quotedPost
    }
    return <div className={"pointer-events-none"}>
        <PostRecordEmbed
            embed={embed}
            navigateOnClick={false}
        />
    </div>
}