"use client";

import { ReactNode, useEffect, useState } from "react";

type ColumnsProps = {
    left?: ReactNode;
    center?: ReactNode;
    right?: ReactNode;
    leftMinWidth?: string;
    rightMinWidth?: string;
    maxWidthCenter?: string;
    centerMinWidth?: string;
    border?: boolean
};

export const ThreeColumnsLayout: React.FC<ColumnsProps> = ({
    left = null,
    center = null,
    right = null,
    leftMinWidth = "0px",
    maxWidthCenter = "600px",
    centerMinWidth = "524px",
    border = true,
    rightMinWidth = "0px"
}) => {
    const [showSides, setShowSides] = useState(true);

    useEffect(() => {
        const updateLayout = () => {
            const screenWidth = window.innerWidth;
            const leftMin = parseInt(leftMinWidth.replace("px", ""), 10);
            const centerMin = parseInt(centerMinWidth.replace("px", ""), 10);

            if (screenWidth < centerMin + 2 * leftMin) {
                setShowSides(false); // hide side columns if too narrow
            } else {
                setShowSides(true); // show side columns if wide enough
            }
        };

        updateLayout();

        window.addEventListener("resize", updateLayout);

        return () => {
            window.removeEventListener("resize", updateLayout);
        };
    }, [leftMinWidth, centerMinWidth]);

    return (
        <div className="flex justify-center w-full">
            {showSides && (
                <div className="flex-shrink-0" style={{ minWidth: leftMinWidth }}>
                    {left}
                </div>
            )}

            <div
                className={"flex-grow min-h-screen" + (border ? " border-l border-r" : "")}
                style={{
                    minWidth: "0",
                    maxWidth: maxWidthCenter,
                }}
            >
                {center}
            </div>

            {showSides && (
                <div className="flex-shrink-0" style={{ minWidth: rightMinWidth }}>
                    {right}
                </div>
            )}
        </div>
    );
};
