"use client"

import { ReactNode, useEffect, useState } from "react";

type ColumnsProps = {
    left?: ReactNode;
    center?: ReactNode;
    right?: ReactNode;
    leftMinWidth?: string;
    maxWidthCenter?: string;
    centerMinWidth?: string;
};

export const ThreeColumnsLayout: React.FC<ColumnsProps> = ({
    left = null,
    center = null,
    right = null,
    leftMinWidth = "0px", // default min width
    maxWidthCenter = "800px", // default max width
    centerMinWidth = "400px", // default min width for center
}) => {
    const [showSides, setShowSides] = useState(true);

    useEffect(() => {
        const updateLayout = () => {
            const screenWidth = window.innerWidth;
            const leftMin = parseInt(leftMinWidth.replace("px", ""), 10);
            const centerMin = parseInt(centerMinWidth.replace("px", ""), 10);

            // If the screen is smaller than centerMinWidth + 2 * leftMinWidth, hide sides
            if (screenWidth < centerMin + 2 * leftMin) {
                setShowSides(false);
            } else {
                setShowSides(true);
            }
        };

        // Initial check
        updateLayout();

        // Add resize listener
        window.addEventListener("resize", updateLayout);

        // Clean up the event listener on unmount
        return () => {
            window.removeEventListener("resize", updateLayout);
        };
    }, [leftMinWidth, centerMinWidth]);

    return (
        <div className="flex justify-center w-full">
            {/* Left Column */}
            {showSides && (
                <div
                    className="flex-shrink-0"
                    style={{ minWidth: leftMinWidth }}
                >
                    {left}
                </div>
            )}

            {/* Center Column */}
            <div
                className="flex-grow px-1 lg:px-0"
                style={{ maxWidth: maxWidthCenter, minWidth: centerMinWidth }}
            >
                {center}
            </div>

            {/* Right Column */}
            {showSides && (
                <div
                    className="flex-shrink-0"
                    style={{ minWidth: leftMinWidth }}
                >
                    {right}
                </div>
            )}
        </div>
    );
};
