import { useEffect, useRef, useState } from "react";
import { ToggleButton } from "./toggle-button";
import { ModalBelow } from "./modal-below";

const SubcategoriesList = ({ nextCategories, route, setRoute }: { nextCategories: string[], route: string[], setRoute: (r: string[]) => void }) => {
    return nextCategories.map((nextCategory: string, index: number) => (
        <div key={index}>
            <button
                onClick={() => setRoute([...route, nextCategory])}
                className="subcategories-dropdown w-full bg-[var(--background)] py-1 px-2"
            >
                <span className="flex justify-center w-full content text-[var(--primary)]">
                    {nextCategory}
                </span>
            </button>
        </div>
    ))
};

export const SubcategoriesDropDown = ({ nextCategories, route, setRoute, selected }: { nextCategories: string[], route: string[], setRoute: (v: string[]) => void, selected: string }) => {
    const [viewSubcategories, setViewSubcategories] = useState(false);

    return (
        <div className="relative ml-2">
            <ToggleButton
                className="filter-btn"
                setToggled={setViewSubcategories}
                toggled={viewSubcategories}
                text="Filtrar"
            />
            {viewSubcategories && (
                <ModalBelow className="w-64 space-y-1" open={viewSubcategories} setOpen={setViewSubcategories}>
                    <SubcategoriesList
                        route={route}
                        setRoute={setRoute}
                        nextCategories={nextCategories}
                    />
                </ModalBelow>
            )}
        </div>
    );
};
