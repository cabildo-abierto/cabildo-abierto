import {useLayoutConfig} from "../layout/layout-config-context";
import {pxToNumber} from "../utils";
import {ReactNode, useEffect, useState} from "react";


export const CardFeed = ({elements, generator}: {elements: any[], generator: (x: any, width: number) => ReactNode}) => {
    const {layoutConfig} = useLayoutConfig()

    const screenWidth = window.innerWidth
    const rightSide = layoutConfig.openRightPanel && layoutConfig.spaceForRightSide ? pxToNumber(layoutConfig.rightMinWidth) : 0
    const leftSide = layoutConfig.spaceForLeftSide ? 224 : 80

    const [availableWidth, setAvailableWidth] = useState(Math.min(screenWidth - rightSide - leftSide, pxToNumber(layoutConfig.maxWidthCenter)))

    useEffect(() => {
        const updateLayout = () => {
            const screenWidth = window.innerWidth
            const rightSide = layoutConfig.openRightPanel && layoutConfig.spaceForRightSide ? pxToNumber(layoutConfig.rightMinWidth) : 0
            const leftSide = layoutConfig.spaceForLeftSide ? 224 : 80
            setAvailableWidth(Math.min(screenWidth - rightSide - leftSide, pxToNumber(layoutConfig.maxWidthCenter)))
        };

        updateLayout()

        window.addEventListener("resize", updateLayout)

        return () => {
            window.removeEventListener("resize", updateLayout)
        }
    }, [])

    const minGapX = 40
    const minMargin = 20*2

    let elementsPerRow = 1
    if(availableWidth >= 240*3+minGapX*2+minMargin){
        elementsPerRow = 3
    } else if (availableWidth >= 240*2+minGapX+minMargin){
        elementsPerRow = 2
    }

    const elementWidth = (availableWidth - minMargin - minGapX * (elementsPerRow-1))/elementsPerRow

    return <div className={"mb-32"}>
        {Array.from({ length: Math.ceil(elements.length / elementsPerRow) }, (_, rowIndex) => (
            <div
                key={rowIndex}
                className={
                    "mt-14 flex w-full px-4 " +
                    (elementsPerRow === 3 ? "justify-between" : elementsPerRow === 2 ? "space-x-10" : "justify-center")
                }
            >
                {elements.slice(rowIndex * elementsPerRow, (rowIndex + 1) * elementsPerRow).map((e, index) => (
                    <div key={index}>{generator(e, elementWidth)}</div>
                ))}
            </div>
        ))}
    </div>
}