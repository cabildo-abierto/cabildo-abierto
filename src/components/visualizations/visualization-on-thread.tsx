import {ProfilePic} from "../feed/profile-pic";
import {ContentTopRowAuthor} from "../feed/content-top-row-author";
import {EngagementProps, VisualizationProps} from "../../app/lib/definitions";
import {DatasetTitle} from "../datasets/dataset-title";
import {EngagementIcons} from "../reactions/engagement-icons";
import {VegaPlot} from "./vega-plot";
import {IconButton} from "@mui/material";
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import {useLayoutConfig} from "../layout/layout-config-context";
import {pxToNumber} from "../utils/strings";
import {useEffect, useState} from "react";


export const VisualizationOnThread = ({visualization}: {visualization: VisualizationProps & EngagementProps}) => {
    const {layoutConfig, setLayoutConfig} = useLayoutConfig()
    const [canvasWidth, setCanvasWidth] = useState(null)


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


    function invertLayout(){
        if(layoutConfig.maxWidthCenter == "600px"){
            setLayoutConfig({
                ...layoutConfig,
                maxWidthCenter: "800px",
                openRightPanel: false
            })
        } else {
            setLayoutConfig({
                ...layoutConfig,
                maxWidthCenter: "600px",
                openRightPanel: true
            })
        }
    }

    return <div className={"space-y-2 pb-2 border-b w-full"}>
        <div className={"flex justify-end items-center px-2"}>
            <div className={"lg:block hidden text-[var(--text-light)]"}>
                <IconButton size={"small"} onClick={invertLayout}>
                    {layoutConfig.maxWidthCenter == "600px" ?
                        <FullscreenIcon fontSize="small" color={"inherit"}/> :
                        <FullscreenExitIcon fontSize="small" color={"inherit"}/>
                    }
                </IconButton>
            </div>
        </div>
        <div className={"flex items-center space-x-2 text-sm px-2"}>
            <ProfilePic user={visualization.author} className={"w-5 h-5 rounded-full"}/>
            <ContentTopRowAuthor author={visualization.author}/>
        </div>
        <div className={"flex space-x-1 items-end px-2"}>
            <DatasetTitle dataset={visualization.visualization.dataset} className={"max-[500px]:text-xs text-[var(--text-light)]"}/>
        </div>
        <div className={"flex justify-center mt-4 w-full px-2"}>
            <VegaPlot
                visualization={visualization}
                width={canvasWidth-20}
            />
        </div>
        <div className={"border-t pt-2"}>
            <EngagementIcons record={visualization} counters={visualization} className={"flex justify-between px-2"}/>
        </div>
    </div>
}