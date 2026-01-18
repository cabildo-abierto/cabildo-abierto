import React from "react";
import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { AggregationLevel } from "../data-parser";

type DateAggregationMenuProps = {
    availableLevels: AggregationLevel[];
    selectedLevel: AggregationLevel;
    onSelectLevel: (level: AggregationLevel) => void;
    collapsed: boolean;
    onToggleCollapsed: () => void;
};

const levelLabels: Record<AggregationLevel, string> = {
    original: "Original",
    day: "Día",
    month: "Mes",
    year: "Año",
};

export function DateAggregationMenu({
    availableLevels,
    selectedLevel,
    onSelectLevel,
    collapsed,
    onToggleCollapsed,
}: DateAggregationMenuProps) {
    // Only show available levels (hide unavailable ones)
    // Don't render if only "original" is available
    if (availableLevels.length <= 1) return null;

    return (
        <div
            className={cn(
                "absolute bottom-2 left-2 z-[15] bg-[var(--background)] border border-[var(--accent-dark)] shadow-sm",
                "text-sm"
            )}
            onWheel={(e) => e.stopPropagation()}
        >
            <button
                onClick={onToggleCollapsed}
                className="flex items-center justify-between w-full px-2 py-1 hover:bg-[var(--background-dark)] gap-2"
            >
                <span className="font-medium text-[var(--text)] uppercase text-[13px]">Agrupar</span>
                {collapsed ? (
                    <CaretUpIcon className="w-4 h-4 text-[var(--text-light)]" />
                ) : (
                    <CaretDownIcon className="w-4 h-4 text-[var(--text-light)]" />
                )}
            </button>
            {!collapsed && (
                <div 
                    className="px-2 py-1 space-y-0.5 border-t border-[var(--accent-dark)]"
                    onWheel={(e) => e.stopPropagation()}
                >
                    {availableLevels.map((level) => {
                        const isSelected = selectedLevel === level;
                        
                        return (
                            <label
                                key={level}
                                className="flex items-center gap-2 px-1 py-0.5 rounded cursor-pointer hover:bg-[var(--background-dark)]"
                            >
                                <input
                                    type="radio"
                                    name="aggregation-level"
                                    checked={isSelected}
                                    onChange={() => onSelectLevel(level)}
                                    className="accent-[var(--text)]"
                                />
                                <span
                                    className={cn(
                                        "text-xs select-none",
                                        isSelected ? "text-[var(--text)] font-medium" : "text-[var(--text-light)]"
                                    )}
                                >
                                    {levelLabels[level]}
                                </span>
                            </label>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
