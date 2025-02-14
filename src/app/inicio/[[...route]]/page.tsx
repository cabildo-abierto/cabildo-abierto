import React from "react"
import { MainPage } from "../../../components/main-page"
import {getEnDiscusion, getFeed, getFollowingFeed} from "../../../actions/feed";


const Page: React.FC<{
    params: {route: string[]}
    searchParams: { [key: string]: string }
}> = async ({params, searchParams}) => {

    return <MainPage/>
}
export default Page