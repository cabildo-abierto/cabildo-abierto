import {scaleTime} from "d3-scale";
import {scaleLinear} from "@visx/scale";
import {max, min} from "../../../utils/arrays"

type DataRow = Record<string, any>;
type DataPoint = {x: any, y: any};

function guessType(data: DataRow[], axis: string): "number" | "string" | "date" | null {
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

export class Plotter {
    private xAxis: string;
    private yAxis: string;
    private plotType: string;
    private data: DataRow[] = [];
    private dataPoints: DataPoint[] = [];
    private xAxisType: string;
    private yAxisType: string;

    constructor(
        rawData: string,
        xAxis: string,
        yAxis: string,
        plotType: string = "CurvePlot"
    ) {
        this.xAxis = xAxis;
        this.yAxis = yAxis;
        this.plotType = plotType;
        this.data = JSON.parse(rawData);
        this.xAxisType = guessType(this.data, xAxis);
        this.yAxisType = guessType(this.data, yAxis);
    }

    public convertTypes(): void {
        console.log("xAxisType: ", this.xAxisType,"   yAxisType: ", this.yAxisType)
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

    public getScale(axis: string, innerMeasure: number) {
        const domain = this.getDomain(axis)
                const type = axis === 'x' ? this.xAxisType : this.yAxisType
        if (type === 'number') {
            return scaleLinear<number>({
                domain: domain as number[],
                range: axis === 'x' ? [0, innerMeasure] : [innerMeasure, 0],
                nice: true,
            });
        }

        if (type === 'date') {
            return scaleTime<Date>(domain as Date[]);
        }

        //if (axis === "x") {
        //    return scaleTime<number | Date | string>({
        //        domain: this.getXDomain(),
        //        range: [0, innerWidth],
        //        padding: 0.4,
        //    });
        //}
        //else {
        //    const yMax = Math.max(...this.dataPoints.map((d) => d.y), 0);
        //    return scaleLinear<number | Date | string>({
        //        domain: this.getYDomain(),
        //        range: [innerHeight, 0],
        //        nice: true,
        //        });
        //}

    }

    public getDomain(axis: string): (Date | number | string)[] {
        const axisPoints = this.dataPoints.map((d) => d[axis])
        return [min(axisPoints), max(axisPoints)]
    }

    public getYDomain(): (Date | number | string)[] {
        return this.dataPoints.map((d) => d.y)
    }

    public sortByX(): void {
        this.dataPoints.sort((a, b) => a.x - b.x);
    }

    public groupSameX(): void {
        const grouped = new Map<string, number[]>();

        this.dataPoints.forEach((d: any) => {
            if (d.x != null && !isNaN(d.y)) {
                if (!grouped.has(d.x)) {
                    grouped.set(d.x, []);
                }
                grouped.get(d.x)!.push(d.y);
            }
        });

        this.dataPoints = Array.from(grouped.entries()).map(([x, ys]) => ({
            x: isNaN(Number(x)) ? x : Number(x),
            y: ys.reduce((sum, val) => sum + val, 0) / ys.length
        }));
    }

    public prepareForPlot(): DataPoint[] {
        this.convertTypes();
        this.groupSameX();
        this.sortByX();
        return this.dataPoints;
    }
}