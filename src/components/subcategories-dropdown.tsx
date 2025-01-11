import { useState } from "react";
import { ModalBelow } from "./modal-below";
import Button from "@mui/material/Button";

const SubcategoriesList = ({ nextCategories, route, setRoute }: { nextCategories: string[], route: string[], setRoute: (r: string[]) => void }) => {
    return <div className="p-1 space-y-1">{nextCategories.map((nextCategory: string, index: number) => (
        <div key={index}>
            <button
                onClick={() => setRoute([...route, nextCategory])}
                className="bg-[var(--content)] border rounded hover:bg-[var(--content2)] py-1 px-2 w-64"
            >
                <span className="flex justify-center w-full content text-[var(--primary)]">
                    {nextCategory}
                </span>
            </button>
        </div>
    ))}</div>
};

export const SubcategoriesDropDown = ({ nextCategories, route, setRoute, selected }: { nextCategories: string[], route: string[], setRoute: (v: string[]) => void, selected: string }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    return (
        <div className="relative">
            <Button
                variant="outlined"
                onClick={(e) => {setAnchorEl(e.target)}}
            >
                {route.length > 0 ? "Subcategoría" : "Categoría"}
            </Button>
            <ModalBelow
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => {setAnchorEl(null)}}>
                <div className="space-y-1 mt-1 bg-[var(--background)] border rounded">
                    <SubcategoriesList
                        route={route}
                        setRoute={setRoute}
                        nextCategories={nextCategories}
                    />
                </div>
            </ModalBelow>
        </div>
    );
};
