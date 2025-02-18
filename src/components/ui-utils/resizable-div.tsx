"use client";

import {ReactNode, useState} from "react";
import { Box } from "@mui/material";

const ResizableDiv = ({initialWidth, minWidth, maxWidth, children, side}: {
    initialWidth: number, minWidth: number, maxWidth: number, children: ReactNode, side: string}) => {
    const [width, setWidth] = useState(initialWidth)

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        const startX = e.clientX;
        const startWidth = width;
        document.body.style.userSelect = "none";

        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - startX;
            const newWidth =
                side === "left"
                    ? Math.max(minWidth, Math.min(maxWidth, startWidth - deltaX))
                    : Math.max(minWidth, Math.min(maxWidth, startWidth + deltaX));

            setWidth(newWidth);
        };

        const handleMouseUp = () => {
            document.body.style.userSelect = "";
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    return (
        <Box
            sx={{
                width,
                minWidth,
                maxWidth,
                position: "relative",
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    width: 10,
                    cursor: "ew-resize",
                    bgcolor: "transparent",
                    [side]: 0,
                }}
                onMouseDown={handleMouseDown}
            />
            {children}
        </Box>
    );
};

export default ResizableDiv;
