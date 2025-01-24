"use client"
import React, {useState} from "react"
import { MainPage } from "../../../components/main-page"


const Page: React.FC<{
    params: {route: string[]}
    searchParams: { [key: string]: string }
}> = ({params, searchParams}) => {

    return <MainPage/>
}
export default Page