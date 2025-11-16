import { ArCabildoabiertoFeedDefs } from "@cabildo-abierto/api";


export default function MockPost({postView}: { postView?: ArCabildoabiertoFeedDefs.PostView }) {
    return <div>
        {postView && (postView.record as any).text}
    </div>
}