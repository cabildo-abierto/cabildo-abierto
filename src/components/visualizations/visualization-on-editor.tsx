import {PlotConfigProps} from "@/lib/types";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
//import {getSpecForConfig} from "./editor/get-spec";
//import embed from "vega-embed";
//import {View} from "vega";
import {useEffect, useRef} from "react";
import {DatasetView} from "@/lex-api/types/ar/cabildoabierto/data/dataset";


export const VisualizationOnEditor = ({config, setCurrentView, dataset}: {
    config: PlotConfigProps
    setCurrentView: (v: any) => void
    dataset: DatasetView
}) => {
    const chartRef = useRef(null)

    useEffect(() => {

        const renderChart = async () => {
            //const spec = getSpecForConfig(config, dataset, true)

            //const result = await embed(chartRef.current, spec, {actions: false})
            //const { view } = result;
            //setCurrentView(view)
        }

        if(dataset && dataset.data){
            renderChart()
        }
    },[config, dataset])

    if(!dataset || !dataset.data) return <div className={"p-4"}>
        <LoadingSpinner/>
    </div>


    return <div className="h-full flex items-center justify-center" ref={chartRef}/>
}