import {scaleBand, scaleTime} from "@visx/scale";
import {scaleLinear} from "@visx/scale";
import {formatIsoDate} from "@/utils/dates";
import {ScaleBand, ScaleLinear, ScaleTime} from "d3-scale";
import {useTooltip} from "@visx/tooltip";

type DataRow = Record<string, any>;
export type DataPoint = {x: any, y: any};
export type TooltipHookType = ReturnType<typeof useTooltip>;

function guessType(data: DataRow[], axis: string): DataType {
    let numCount = 0;
    let dateCount = 0;
    let stringCount = 0;

    const sampleSize = Math.min(20, data.length); // check up to 20 values
    for (let i = 0; i < sampleSize; i++) {
        const value = data[i][axis];

        if (value == null || value === '') continue;
        if (!isNaN(Number(value))) {
            numCount++;
            continue;
        }
        const parsedDate = new Date(value);
        if (!isNaN(parsedDate.getTime())) {
            dateCount++;
            continue;
        }
        stringCount++;
    }

    const maxCount = Math.max(numCount, dateCount, stringCount);
    if (maxCount === 0) return null;
    if (maxCount === numCount && dateCount === 0 && stringCount === 0) return "number";
    if (maxCount === dateCount && numCount === 0 && stringCount === 0) return "date";
    if (maxCount === stringCount && numCount === 0 && dateCount === 0) return "string";
    return null;
}

export type DataType = "number" | "string" | "date" | null
export type ValueType = string | number | Date | null

export class Plotter {
    private xAxis: string;
    private yAxis: string;
    private plotType: string;
    private data: DataRow[] = [];
    private dataPoints: DataPoint[] = [];
    private xAxisType: DataType;
    private yAxisType: DataType;

    constructor(
        rawData: string,
        xAxis: string,
        yAxis: string,
        plotType: string
    ) {
        this.xAxis = xAxis;
        this.yAxis = yAxis;
        this.plotType = plotType;
        this.data = JSON.parse(rawData);
        this.xAxisType = guessType(this.data, xAxis);
        this.yAxisType = guessType(this.data, yAxis);
    }

    public convertTypes(): void {
        this.dataPoints = this.data.map(row => {
            let x: any = row[this.xAxis];
            let y: any = row[this.yAxis];

            // Convert X value
            if (this.xAxisType === "number") {
                x = parseFloat(x);
            } else if (this.xAxisType === "date") {
                x = new Date(x);
            } else {
                x = String(x);
            }

            // Convert Y value
            if (this.yAxisType === "number") {
                y = parseFloat(y);
            } else if (this.yAxisType === "date") {
                y = new Date(y);
            } else {
                y = String(y);
            }

            return { x, y };
        });
    }

    isBarplot(): boolean {
        return this.plotType === "ar.cabildoabierto.embed.visualization#barplot"
    }

    isCurvePlot(): boolean {
        return this.plotType === "ar.cabildoabierto.embed.visualization#lines"
    }

    public getScale(axis: string, innerMeasure: number) {
        const domain = this.getDomain(axis)
        const type = axis === 'x' ? this.xAxisType : this.yAxisType
        if (this.isBarplot() && axis === 'x') {
            const res: ScaleBand<string> = scaleBand<string>({
                domain: domain as string[],
                range: [0, innerMeasure],
                padding: 0.2,
            });
            return res
        }

        if (type === 'number') {
            const res: ScaleLinear<number, number> = scaleLinear({
                domain: domain as number[],
                range: axis === 'x' ? [0, innerMeasure] : [innerMeasure, 0],
                nice: true,
            });
            return res
        }

        if (type === 'date') {
            const res: ScaleTime<number, number> = scaleTime({domain: domain as Date[], range: [0, innerMeasure], nice: true});
            return res
        }


         throw new Error(`Cannot create scale: unknown type for axis "${axis}"`);
    }

    public getDomain(axis: string): [number, number] | [Date, Date] | string[]{
        const values = this.dataPoints.map((d) => d[axis]);
        const type = axis === 'x' ? this.xAxisType : this.yAxisType;

        if (this.isBarplot() && type === "number") {
            if (axis === 'y'){
                const nums = values as number[];
                return [0, Math.max(...nums)]
            }
            if (axis === 'x'){
                return this.dataPoints.map((d) => d.x)
            }
        }

        if (type === "number") {
            const nums = values as number[];
            return [Math.min(...nums), Math.max(...nums)];
        }

        if (type === "date") {
            const dates = values as Date[];
            const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
            const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
            return [minDate, maxDate]
        }

        if (type === "string") {
            return this.dataPoints.map((d) => d.x)
        }

        throw new Error("Scale only supported for number, date or string axes");
    }

    public sortByX(): void {
        this.dataPoints.sort((a, b) => a.x - b.x);
    }

    public groupSameX(): void {
        const grouped = new Map<string | number | Date, number[]>();

        this.dataPoints.forEach((d: any) => {
            if (d.x != null && !isNaN(d.y)) {
                grouped.set(d.x, [...(grouped.get(d.x) ?? []), d.y])
            }
        });

        this.dataPoints = Array.from(grouped.entries()).map(([x, ys]) => ({
            x: x,
            y: ys.reduce((sum, val) => sum + val, 0) / ys.length
        }));
    }

    public prepareForPlot(): DataPoint[] {
        this.convertTypes();
        this.groupSameX();
        this.sortByX();
        return this.dataPoints;
    }

    valueToString(v: ValueType, type: DataType): string{
        if(type == "string"){
            return v as string
        } else if(type == "date"){
            return formatIsoDate(v as Date)
        } else if(type == "number"){
            return (v as number).toFixed(2).toString()
        }
    }

    xValueToString(x: ValueType): string {
        return this.valueToString(x, this.xAxisType);
    }

    yValueToString(y: ValueType): string {
        return this.valueToString(y, this.yAxisType);
    }
}