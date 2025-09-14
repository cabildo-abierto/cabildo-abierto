import { PostView } from "@/lex-api/types/ar/cabildoabierto/feed/defs";




export default function MockPost({postView}: { postView?: PostView }) {
    return <div>
        {postView && (postView.record as any).text}
    </div>
}