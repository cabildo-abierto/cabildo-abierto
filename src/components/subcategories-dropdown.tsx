import { useEffect, useRef, useState } from "react";

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Link from "next/link";
import AddIcon from '@mui/icons-material/Add';

function routeToUrl(route: string[]){
    return "/inicio/" + route.map(encodeURIComponent).join("/")
}

export const SubcategoriesDropDown = ({ nextCategories, route, selected }: { nextCategories: Set<string>, route: string[], selected: string }) => {
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
            <button className="text-2xl w-48 flex items-center justify-center h-8 font-bold bodoni text-[var(--primary)] border hover:bg-[var(--secondary-light)] rounded px-2" onClick={() => setViewSubcategories(!viewSubcategories)}>
                <AddIcon/>
            </button>
            {viewSubcategories && (
                nextCategories.size > 0 ?
                    <div className="w-full absolute top-full mt-2 left-0 z-10"> {/* Position the dropdown absolutely */}
                        {[...nextCategories].map((nextCategory: string, index: number) => (
                            <div key={index}>
                                <Link href={routeToUrl([...route, nextCategory])+"?selected="+selected}>
                                    <button className="subcategories-dropdown w-full bg-[var(--background)] py-1 mt-1 px-2">
                                        <div className="flex justify-center w-full">
                                            {nextCategory}
                                        </div>
                                    </button>
                                </Link>
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