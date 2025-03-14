"use client"
import {useDatasets} from "../../../hooks/contents";
import {useEffect, useRef, useState} from "react";
import {DatasetProps, PlotConfigProps} from "../../../app/lib/definitions";
import {ConfigPanel} from "./config-panel";
import {ChooseDatasetPanel} from "./choose-dataset";
import {EditorViewer} from "./editor-viewer";
import {AcceptButtonPanel} from "../../ui-utils/accept-button-panel";
import {getDataset} from "../../../actions/dataset/read";


const ErrorPanel = ({msg}: {msg?: string}) => {
    const [openMsgPopup, setOpenMsgPopup] = useState(msg != null)

    return <AcceptButtonPanel
        open={openMsgPopup}
        onClose={() => {setOpenMsgPopup(false)}}
    >
        <div className={"flex flex-col items-center pb-6 px-6 max-w-[400px]"}>
            <h2 className={"mb-4"}>Ocurrió un error</h2>
            <div className={"text-center text-[var(--text-light)]"}>
                {msg}
            </div>
        </div>
    </AcceptButtonPanel>
}


export const VisualizationEditor = ({initialConfig, msg}: {msg?: string, initialConfig?: PlotConfigProps}) => {
    const { datasets } = useDatasets()
    const [config, setConfig] = useState<PlotConfigProps>(initialConfig ? initialConfig : { filters: [], kind: "Tipo de gráfico" })
    const [dataset, setDataset] = useState<{ dataset?: DatasetProps, data?: any[] } | null>(null)
    const [selected, setSelected] = useState(initialConfig ? "Visualización" : "Datos")
    const sidebarWidth = 80
    const [rightSideWidth, setRightSideWidth] = useState(400)
    const [leftSideWidth, setLeftSideWidth] = useState(320)
    const [centerMaxWidth, setCenterMaxWidth] = useState(window.innerWidth - sidebarWidth - leftSideWidth - rightSideWidth)

    const leftRef = useRef<HTMLDivElement>(null)
    const rightRef = useRef<HTMLDivElement>(null)
    const editorMinWidth = 1080
    const [wideEnough, setWideEnough] = useState(window.innerWidth >= editorMinWidth)


    useEffect(() => {

        const handleResize = () => {
            setCenterMaxWidth(
                window.innerWidth - sidebarWidth - leftSideWidth - rightSideWidth
            );
            setWideEnough(window.innerWidth >= editorMinWidth)
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [])

    useEffect(() => {
        setCenterMaxWidth(
            window.innerWidth - sidebarWidth - leftSideWidth - rightSideWidth
        )
    }, [leftSideWidth, rightSideWidth])

    useEffect(() => {
        if (leftRef.current) {
            const resizeObserver = new ResizeObserver((entries) => {
                for (let entry of entries) {
                    const { width } = entry.contentRect;
                    setLeftSideWidth(width);
                }
            });

            resizeObserver.observe(leftRef.current);

            return () => {
                resizeObserver.disconnect();
            };
        }
    }, []);


    useEffect(() => {
        if (rightRef.current) {
            const resizeObserver = new ResizeObserver((entries) => {
                for (let entry of entries) {
                    const { width } = entry.contentRect;
                    setRightSideWidth(width);
                }
            });

            resizeObserver.observe(rightRef.current);

            return () => {
                resizeObserver.disconnect();
            };
        }
    }, []);

    useEffect(() => {
        async function getSelectedDataset() {
            for(let i = 0; i < datasets.length; i++){
                if(datasets[i].uri == config.datasetUri){

                    setDataset({ dataset: datasets[i] });
                    const d = await getDataset(config.datasetUri);
                    setDataset(d)
                }
            }
        }

        if (config.datasetUri && datasets) {
            if(!dataset || config.datasetUri != dataset.dataset.uri){
                if(dataset && config.datasetUri != dataset.dataset.uri){
                    setConfig({
                        datasetUri: config.datasetUri,
                        kind: config.kind
                    })
                }
                getSelectedDataset()
            }
        }
    }, [config.datasetUri, datasets]);

    const updateConfig = (key, value) => {
        setConfig((prevState) => ({
            ...prevState,
            [key]: value,
        }));
        if (selected != "Visualización" && key != "datasetUri") {
            setSelected("Visualización");
        }
    }

    if(!wideEnough){
        return <div className={"h-screen w-full flex justify-center items-center text-[var(--text-light)]"}>
            Abrí el editor en una pantalla más grande.
        </div>
    }

    const center = <EditorViewer
        config={config}
        selected={selected}
        setSelected={setSelected}
        maxWidth={centerMaxWidth-8*4-3*4-8*4-4*4-20}
        dataset={dataset}
    />

    const left = <div ref={leftRef} className={"pr-8 pl-3"}>
        <ChooseDatasetPanel
            datasets={datasets}
            config={config}
            updateConfig={updateConfig}
        />
    </div>

    const right = <div ref={rightRef} className={"pl-8 pr-4"}>
        <ConfigPanel
            config={config}
            updateConfig={updateConfig}
            dataset={dataset ? dataset.dataset : undefined}
        />
    </div>

    return <div className={"flex justify-between w-[calc(100vw-100px)]"}>

        <div>
            {left}
        </div>

        <div className={"flex-grow"}>
            {center}
        </div>

        <div>
            {right}
        </div>

        <ErrorPanel msg={msg}/>
    </div>
}