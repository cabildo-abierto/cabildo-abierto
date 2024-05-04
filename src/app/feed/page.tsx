import React from "react"
import Feed from "./feed"
import {getAllDiscussionsWithAuthors} from "@/actions/get-discussion";


const Home: React.FC = async () => {
    const discussions = await getAllDiscussionsWithAuthors()

    return (
        <>
            <div className="flex justify-center items-center">
                <Feed feed={discussions}/>
            </div>
        </>
    )
}

export default Home