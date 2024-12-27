"use client"
import {ThreeColumnsLayout} from "../../components/three-columns";
import {useEffect, useState} from "react";
import { getVisualizations} from "../../actions/data";
import {BasicButton} from "../../components/ui-utils/basic-button";
import '../../components/datasets/index.css'
import Link from "next/link";
import {VegaLite} from "react-vega";

const Page = () => {
    const [visualizations, setVisualizations] = useState(null)

    useEffect(() => {
        async function fetchVisualizations(){
            const v = await getVisualizations()
            setVisualizations(v)
        }
        fetchVisualizations()
    }, [])

    const center = <div className={"flex mt-8"}>
        <Link href={"/visualizaciones/editor"}>
            <BasicButton>
                Nueva visualización
            </BasicButton>
        </Link>
        <div>
            {visualizations && visualizations.map((v, index) => {
                return <div key={index} className={"flex justify-center"}>
                    <VegaLite spec={JSON.parse(v.visualization.spec)} actions={false}/>
                </div>
            })}
        </div>
    </div>
    return <ThreeColumnsLayout center={center}/>
}


export default Page