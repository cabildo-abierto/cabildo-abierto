import React from "react"
import { getPostsFollowing } from "@/actions/get-content";
import Feed from "@/components/feed";
import { ThreeColumnsLayout } from "@/components/main-layout";


const Inicio: React.FC = async () => {
    const feed = await getPostsFollowing()

    const center = <div className="bg-white h-full">
        <h2 className="ml-2 py-8">
            Siguiendo
        </h2>
        <Feed contents={feed}/>
    </div>

    return <ThreeColumnsLayout center={center} />
}

export default Inicio