import MUIIconButton from "@mui/material/IconButton";
import type { IconButtonProps as MUIIconButtonProps } from "@mui/material/IconButton";
import { darker } from "./button";
import {Color} from "./color";

type ExtendedSize = MUIIconButtonProps["size"] | "extra-small";

type IconButtonProps = Omit<MUIIconButtonProps, "color" | "size"> & {
    color?: Color;
    hoverColor?: Color;
    textColor?: Color;
    size?: ExtendedSize;
};

export const IconButton = ({
    children,
    sx,
    color = "background",
    hoverColor,
    textColor,
    size,
    ...props
}: IconButtonProps) => {
    if (!textColor) textColor = color === "primary" ? "button-text" : "text";

    const extraSmallStyles =
        size === "extra-small"
            ? {
                padding: "2px",
                minWidth: 0,
                minHeight: 0,
                fontSize: "0.85rem",
            }
            : {};

    return (
        <MUIIconButton
            {...props}
            size={size !== "extra-small" ? size : undefined}
            sx={{
                textTransform: "none",
                color: `var(--${textColor})`,
                backgroundColor: `var(--${color})`,
                ":hover": {
                    backgroundColor: hoverColor ? `var(--${hoverColor})` : `var(--${darker(color)})`,
                },
                ...extraSmallStyles,
                ...sx,
            }}
        >
            {children}
        </MUIIconButton>
    );
};
