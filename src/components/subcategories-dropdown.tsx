import { useEffect, useRef, useState } from "react";
import { ToggleButton } from "./toggle-button";

const SubcategoriesList = ({ nextCategories, route, setRoute }: { nextCategories: string[], route: string[], setRoute: (r: string[]) => void }) => {
    return nextCategories.map((nextCategory: string, index: number) => (
        <div key={index}>
            <button
                onClick={() => setRoute([...route, nextCategory])}
                className="subcategories-dropdown w-full bg-[var(--background)] py-1 mt-1 px-2"
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
    const dropdownRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setViewSubcategories(false);
            }
        };

        if (viewSubcategories) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [viewSubcategories]);

    useEffect(() => {
        if (viewSubcategories && panelRef.current) {
            const panel = panelRef.current;
            const boundingRect = panel.getBoundingClientRect();
            console.log(boundingRect, window.innerWidth) 
            if (boundingRect.right > window.innerWidth) {
                console.log("changing left")
                panel.style.left = `${window.innerWidth - boundingRect.width - boundingRect.left}px`;
                console.log("left", panel.style.left)
            } else if (boundingRect.left < 0) {
                console.log("zero")
                panel.style.left = "0px";
            }
        }
    }, [viewSubcategories]);

    return (
        <div className="relative ml-2" ref={dropdownRef}>
            <ToggleButton
                className="filter-btn"
                setToggled={setViewSubcategories}
                toggled={viewSubcategories}
                text="Filtrar"
            />
            {viewSubcategories && (
                <div ref={panelRef} className="w-64 absolute top-full mt-2 left-0 z-10 sm:px-0 px-2">
                    <SubcategoriesList
                        route={route}
                        setRoute={setRoute}
                        nextCategories={nextCategories}
                    />
                </div>
            )}
        </div>
    );
};
