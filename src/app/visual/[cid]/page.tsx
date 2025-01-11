"use client"
import {ThreeColumnsLayout} from "../../../components/three-columns";
import { getVisualization } from "../../../actions/data";
import {useEffect, useState} from "react";
import {ContentTopRowAuthor} from "../../../components/content-top-row-author";
import dynamic from "next/dynamic";
const VegaLite = dynamic(() => import("react-vega").then((mod) => mod.VegaLite), {
    ssr: false,
});

const Page = ({params}: {params: {cid: string}}) => {
    const [visualization, setVisualization] = useState(null)

    useEffect(() => {
        async function fetchVisualization(){
            const v = await getVisualization(params.cid)
            setVisualization(v)
        }

        if(!visualization){
            fetchVisualization()
        }
    }, [])

    if(!visualization) return <></>

    const center = <div className={"px-2 mt-4"}>
        <div className={"text-[var(--text-light)]"}>
            Visualización
        </div>
        <ContentTopRowAuthor author={visualization.author}/>
        <div className={"flex justify-center mt-4"}>
            <VegaLite spec={JSON.parse(visualization.visualization.spec)} actions={false}/>
        </div>
    </div>

    return <ThreeColumnsLayout center={center}/>
}

export default Page;