import { Button, ButtonProps } from "@mui/material";
import React from "react";

type BasicButtonProps = Omit<ButtonProps, "variant" | "sx"> & {
    variant?: ButtonProps["variant"];
    sx?: ButtonProps["sx"];
};

export const BasicButton: React.FC<BasicButtonProps> = ({
                                                            children,
                                                            variant = "contained",
                                                            sx = {},
                                                            ...props
                                                        }) => {
    return (
        <Button
            variant={variant}
            sx={{ textTransform: "none", ...sx }}
            {...props}
            disableElevation={true}
        >
            {children}
        </Button>
    );
};
