import React from "react";
import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";
import { Checkbox } from "@/components/utils/ui/checkbox";
import { cn } from "@/lib/utils";

type LineLegendMenuProps = {
    colors: string[];
    getLabelColor: (label: string) => string;
    hiddenLines: Set<string>;
    onToggleLine: (color: string) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    collapsed: boolean;
    onToggleCollapsed: () => void;
};

export function LineLegendMenu({
    colors,
    getLabelColor,
    hiddenLines,
    onToggleLine,
    onSelectAll,
    onDeselectAll,
    collapsed,
    onToggleCollapsed,
}: LineLegendMenuProps) {
    if (colors.length <= 1) return null;

    const allSelected = hiddenLines.size === 0;
    const noneSelected = hiddenLines.size === colors.length;

    return (
        <div
            className={cn(
                "absolute bottom-2 right-2 z-[15] bg-[var(--background)] border border-[var(--accent-dark)] rounded shadow-sm",
                "text-sm max-w-[180px]"
            )}
            onWheel={(e) => e.stopPropagation()}
        >
            <button
                onClick={onToggleCollapsed}
                className="flex items-center justify-between w-full px-2 py-1 hover:bg-[var(--background-dark)] rounded-t"
            >
                <span className="font-medium text-[var(--text)]">Seleccionar datos</span>
                {collapsed ? (
                    <CaretDownIcon className="w-4 h-4 text-[var(--text-light)]" />
                ) : (
                    <CaretUpIcon className="w-4 h-4 text-[var(--text-light)]" />
                )}
            </button>
            {!collapsed && (
                <div className="border-t border-[var(--accent-dark)]">
                    <div className="flex justify-between px-2 py-1 text-xs text-[var(--text-light)] border-b border-[var(--accent-dark)]">
                        <button
                            onClick={onSelectAll}
                            disabled={allSelected}
                            className={cn(
                                !allSelected && "hover:text-[var(--text)]",
                                allSelected && "opacity-50"
                            )}
                        >
                            Todas
                        </button>
                        <button
                            onClick={onDeselectAll}
                            disabled={noneSelected}
                            className={cn(
                                !noneSelected && "hover:text-[var(--text)]",
                                noneSelected && "opacity-50"
                            )}
                        >
                            Ninguna
                        </button>
                    </div>
                    <div 
                        className="px-2 py-1 space-y-1 max-h-[150px] overflow-y-auto custom-scrollbar"
                        onWheel={(e) => e.stopPropagation()}
                    >
                        {colors.map((color) => {
                            const isVisible = !hiddenLines.has(color);
                            const lineColor = getLabelColor(color);
                            return (
                                <label
                                    key={color}
                                    className="flex items-center gap-2 cursor-pointer hover:bg-[var(--background-dark)] px-1 py-0.5 rounded"
                                >
                                    <Checkbox
                                        checked={isVisible}
                                        onCheckedChange={() => onToggleLine(color)}
                                        className="h-3.5 w-3.5"
                                    />
                                    <div
                                        className="w-3 h-3 rounded-full shrink-0"
                                        style={{ backgroundColor: lineColor }}
                                    />
                                    <span
                                        className={cn(
                                            "truncate text-xs select-none",
                                            isVisible ? "text-[var(--text)]" : "text-[var(--text-light)]"
                                        )}
                                        title={color}
                                    >
                                        {color}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
