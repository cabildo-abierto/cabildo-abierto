import {FastPostProps} from "../../app/lib/definitions";
import {VegaLite} from "react-vega";


export const VisualizationInFastPost = ({post}: {post: FastPostProps}) => {
    if(post.content.post.visualization){
        return <div className={"flex justify-center"}>
            <VegaLite spec={{}} actions={false}/>
        </div>
    }

    return <></>
}