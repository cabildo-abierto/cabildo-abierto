import {DatasetTitle} from "@/components/datasets/dataset-title";
import {UserHandle} from "@/components/feed/frame/content-top-row-author";
import {Plot} from "@/components/visualizations/plot";



export function localizeDataset(spec: any){
    if(spec.data && spec.data.url){
        const url = spec.data.url
        if(url.startsWith("https://www.cabildoabierto.com.ar")){
            spec.data.url = url.replace("https://www.cabildoabierto.com.ar","")
        }
    }
    return spec
}

export const VisualizationNodeCompFromSpec = ({uri}: {uri: string}) => {
    /*const {visualization, isLoading, error} = useVisualization(uri)
    const {layoutConfig} = useLayoutConfig()
    const [canvasWidth, setCanvasWidth] = useState(pxToNumber(layoutConfig.maxWidthCenter))

    useEffect(() => {
        const handleResize = () => {
            let newCanvasWidth: number
            if(window.innerWidth < 500){
                newCanvasWidth = pxToNumber(Math.min(window.innerWidth, pxToNumber(layoutConfig.maxWidthCenter)))
            } else {
                newCanvasWidth = pxToNumber(Math.min(window.innerWidth-80, pxToNumber(layoutConfig.maxWidthCenter)))
            }

            if(newCanvasWidth != canvasWidth){
                setCanvasWidth(newCanvasWidth)
            }
        }

        window.addEventListener("resize", handleResize);

        handleResize();

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [layoutConfig]);

    if(isLoading){
        return <div className={"mt-8"}>
            <LoadingSpinner/>
        </div>
    } else if(error){
        return <div className={"p-4 border rounded-lg text-center"}>
            Ocurrió un error al obtener la visualización. Quizás haya sido borrada.
            <div className={"text-xs text-center text-[var(--text-light)] break-all"}>
                Id: {uri}
            </div>
        </div>
    }

    return <VisualizationNodeComp
        visualization={visualization}
        interactive={pxToNumber(layoutConfig.maxWidthCenter) > 600}
        width={canvasWidth-50}
    />*/
    // TO DO
    return null
}


export const VisualizationNodeComp = ({
    visualization,
    showEngagement=true,
    width
}: {
    visualization: any
    showEngagement?: boolean
    width?: number | string
}) => {

    return <div>
        <div
            className={"flex flex-col items-center not-article-content w-full"}
            onClick={(e) => {e.stopPropagation()}}
        >
            <Plot
                visualization={visualization}
                width={width}
            />
        </div>

        <div
            className={"flex mt-2 w-full not-article-content lg:text-sm text-xs lg:flex-row flex-col items-center justify-center"}
        >
            <div className={"exclude-links text-[var(--text-light)] flex flex-col items-center"}>
                <DatasetTitle
                    className={""}
                    dataset={visualization.visualization.dataset}
                />
                <UserHandle content={visualization}/>
            </div>
            {/* TO DO showEngagement && (
                <EngagementIcons
                    content={visualization}
                    className={"space-x-2"}
                />
            )*/}
        </div>
    </div>
}