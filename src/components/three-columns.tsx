"use client";

import { ReactNode, useEffect, useState } from "react";

type ColumnsProps = {
    left?: ReactNode;
    center?: ReactNode;
    right?: ReactNode;
    leftMinWidth?: string;
    maxWidthCenter?: string;
    centerMinWidth?: string;
    border?: boolean
};

export const ThreeColumnsLayout: React.FC<ColumnsProps> = ({
    left = null,
    center = null,
    right = null,
    leftMinWidth = "0px", // default min width for side columns
    maxWidthCenter = "600px", // default max width for the center
    centerMinWidth = "524px", // default min width for the center
    border = true,
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

        // Initial layout check
        updateLayout();

        // Add resize listener
        window.addEventListener("resize", updateLayout);

        // Cleanup event listener on unmount
        return () => {
            window.removeEventListener("resize", updateLayout);
        };
    }, [leftMinWidth, centerMinWidth]);

    return (
        <div className="flex justify-center w-full">
            {/* Left Column */}
            {showSides && (
                <div className="flex-shrink-0" style={{ minWidth: leftMinWidth }}>
                    {left}
                </div>
            )}

            {/* Center Column */}
            <div
                className={"flex-grow min-h-screen" + (border ? " border-l border-r" : "")}
                style={{
                    minWidth: "0", // Allow center column to shrink as needed
                    maxWidth: maxWidthCenter,
                }}
            >
                {center}
            </div>

            {/* Right Column */}
            {showSides && (
                <div className="flex-shrink-0" style={{ minWidth: leftMinWidth }}>
                    {right}
                </div>
            )}
        </div>
    );
};
