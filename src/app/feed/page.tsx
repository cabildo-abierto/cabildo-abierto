import React from "react"
import Feed from "./feed"
import {getAllDiscussions} from "@/actions/get-comment";


const Home: React.FC = async () => {
    const discussions = await getAllDiscussions()

    return (
        <>
            <div className="flex justify-center items-center">
                <Feed feed={discussions}/>
            </div>
        </>
    )
}

export default Home