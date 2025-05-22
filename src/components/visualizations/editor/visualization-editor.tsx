import {useDatasets} from "@/queries/api";
import {useEffect, useRef, useState} from "react";
import {PlotConfigProps} from "@/lib/types";
import {ConfigPanel} from "./config-panel";
import {ChooseDatasetPanel} from "./choose-dataset";
import {EditorViewer} from "./editor-viewer";
import {AcceptButtonPanel} from "../../../../modules/ui-utils/src/accept-button-panel";
import {CloseButton} from "../../../../modules/ui-utils/src/close-button";
import {Main as Visualization} from "@/lex-api/types/ar/cabildoabierto/embed/visualization"


const ErrorPanel = ({msg}: { msg?: string }) => {
    const [openMsgPopup, setOpenMsgPopup] = useState(msg != null)

    return <AcceptButtonPanel
        open={openMsgPopup}
        onClose={() => {
            setOpenMsgPopup(false)
        }}
    >
        <div className={"flex flex-col items-center pb-6 px-6 max-w-[400px]"}>
            <h2 className={"mb-4"}>Ocurrió un error</h2>
            <div className={"text-center text-[var(--text-light)]"}>
                {msg}
            </div>
        </div>
    </AcceptButtonPanel>
}


type VisualizationEditorProps = {
    onSave: (v: Visualization) => void
    msg?: string
    initialConfig?: PlotConfigProps
    onClose: () => void
}

export const VisualizationEditor = ({initialConfig, msg, onClose, onSave}: VisualizationEditorProps) => {
    const {data: datasets} = useDatasets()
    const [config, setConfig] = useState<PlotConfigProps>(initialConfig ? initialConfig : {$type: "ar.cabildoabierto.embed.visualization"})
    const [selected, setSelected] = useState(initialConfig ? "Visualización" : "Datos")
    const sidebarWidth = 80
    const [rightSideWidth, setRightSideWidth] = useState(400)
    const [leftSideWidth, setLeftSideWidth] = useState(320)
    const [centerMaxWidth, setCenterMaxWidth] = useState(window.innerWidth - sidebarWidth - leftSideWidth - rightSideWidth - 200)

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
                    const {width} = entry.contentRect;
                    setLeftSideWidth(width);
                }
            })

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
                    const {width} = entry.contentRect;
                    setRightSideWidth(width);
                }
            });

            resizeObserver.observe(rightRef.current);

            return () => {
                resizeObserver.disconnect();
            };
        }
    }, []);

    if (!wideEnough) {
        return <div>
            <div className="absolute top-1 right-1">
                <CloseButton size="small" onClose={onClose} color={"background"}/>
            </div>
            <div className={"h-screen flex w-screen justify-center text-center items-center text-[var(--text-light)]"}>
                Abrí el editor en una pantalla más grande
            </div>
        </div>
    }

    const center = <EditorViewer
        config={config}
        selected={selected}
        setSelected={setSelected}
        maxWidth={centerMaxWidth - 8 * 4 - 3 * 4 - 8 * 4 - 4 * 4 - 20}
        onSave={onSave}
    />

    const left = <div ref={leftRef} className={"pr-8 pl-3"}>
        <ChooseDatasetPanel
            datasets={datasets}
            config={config}
            setConfig={setConfig}
        />
    </div>

    const right = <div ref={rightRef} className={"pl-8 pr-4"}>
        <ConfigPanel
            config={config}
            setConfig={(c: PlotConfigProps) => {
                setConfig(c);
                setSelected("Visualización")
            }}
        />
    </div>

    return <div className={"flex justify-between w-[calc(100vw-100px)] h-[calc(100vh-50px)] relative"}>

        <div className="absolute top-1 right-1">
            <CloseButton size="small" onClose={onClose} color={"background"}/>
        </div>

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