import { useEffect, useRef, useState } from "react";
import { ToggleButton } from "./toggle-button";


export const SubcategoriesDropDown = ({ nextCategories, route, setRoute, selected }: { nextCategories: string[], route: string[], setRoute: (v: string[]) => void, selected: string }) => {
    const [viewSubcategories, setViewSubcategories] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setViewSubcategories(false);
            }
        };

        if (viewSubcategories) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [viewSubcategories]);

    return (
        <div className="relative ml-2" ref={dropdownRef}> {/* Make the parent div relative */}
            <ToggleButton 
                className="filter-btn"
                setToggled={setViewSubcategories}
                toggled={viewSubcategories}
                text="Filtrar"
            />
            {viewSubcategories && (
                nextCategories.length > 0 ?
                    <div className="w-64 absolute top-full mt-2 left-0 z-10"> {/* Position the dropdown absolutely */}
                        {[...nextCategories].map((nextCategory: string, index: number) => (
                            <div key={index}>
                                <button
                                    onClick={() => {setRoute([...route, nextCategory])}}
                                    className="subcategories-dropdown w-full bg-[var(--background)] py-1 mt-1 px-2">
                                    <span className="flex justify-center w-full content text-[var(--primary)]">
                                        {nextCategory}
                                    </span>
                                </button>
                            </div>
                        ))}
                    </div>
                    : <div className="w-full absolute top-full mt-2 px-1 left-0 z-10"> {/* Position the dropdown absolutely */}
                        <div className="bg-[var(--background)] border border-[var(--accent)] rounded px-1">No hay subcategorías</div>
                    </div>
            )}
        </div>
    );
};