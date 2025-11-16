import {count} from "@cabildo-abierto/utils";


export function dailyPlotData<T>(data: T[], condition: (x: T, d: Date) => boolean, startDate: Date = new Date(2025, 5, 15)): {date: Date, count: number}[] {
    const oneDay = 1000 * 3600 * 24
    const endDate = new Date(Date.now() + oneDay)
    const res: { date: Date, count: number }[] = []
    for (let d = new Date(startDate); d < endDate; d = new Date(d.getTime() + oneDay)) {
        const c = count(data, u => condition(u, d))
        res.push({date: d, count: c})
    }
    return res
}