import {DataRow, DataType, ValueType} from "@/components/visualizations/editor/plotter/plotter";
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import 'dayjs/locale/es'
import 'dayjs/locale/en'
import {timeFormatLocale} from "d3-time-format";

dayjs.extend(customParseFormat)


export const esLocale = timeFormatLocale({
    dateTime: '%A, %e de %B de %Y, %X',
    date: '%d/%m/%Y',
    time: '%H:%M:%S',
    periods: ['', ''],
    days: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    shortDays: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
    months: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
        'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    shortMonths: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul',
        'ago', 'sep', 'oct', 'nov', 'dic']
})


const dateFormats: [string, string][] = [
    ["YYYY-MM-DD", "es"],
    ['DD-MM-YYYY', "es"],
    ['MM-DD-YYYY', "en"],
    ["MMM-YY", "es"],
    ["MMM-YY", "en"],
    ["MMMM-YY", "es"],
    ["MMMM-YY", "en"],
    ['DD/MM/YYYY', "es"],
    ['MM/DD/YYYY', "en"],
    ['YYYY/MM/DD', "es"],
    ['MMM D, YYYY', "en"],
    ['MMM D, YYYY', "es"],
    ["YYYY-MM-DDTHH:mm:ss", "en"],
    ["YYYY-MM-DDTHH:mm:ss.SSS[Z]", "en"]
]


type ParsingResult = {
    success: false
} | {
    success: true
    dataType: "string"
    value: string
} | {
    success: true
    dataType: "number"
    value: number
} | {
    success: true
    dataType: "date"
    value: Date
} | {
    success: true
    dataType: "string[]"
    value: string[]
}


export class DataParser {

    parseDate(value: string): {success: true, date: Date} | {success: false} {

        for (const [format, locale] of dateFormats) {
            const parsed = dayjs(value, format, locale, true)
            if (parsed.isValid()) {
                return {
                    success: true,
                    date: parsed.toDate()
                }
            }
        }

        return {success: false}
    }

    parseNumber(value: any): {success: true, value: number} | {success: false} {
        if(typeof value == "string"){
            let num: number
            if(value.includes(",")){
                num = Number(value.replace("%", "").replace("$", "").replace(".", "").replace(",", "."))
            } else {
                num = Number(value.replace("%", "").replace("$", ""))
            }
            if(!isNaN(num)){
                return {success: true, value: num}
            }
            return {success: false}
        } else if(typeof value == "number"){
            return {success: true, value: value}
        } else {
            return {success: false}
        }
    }

    parseValue(value: any, type?: DataType): ParsingResult {
        if(value instanceof Array){
            if(value.length == 0){
                return {
                    success: true,
                    value: [],
                    dataType: "string[]"
                }
            }
            const firstValue = this.parseValue(value[0])
            if(firstValue.success && firstValue.dataType == "string"){
                return {
                    success: true,
                    value: value,
                    dataType: "string[]"
                }
            } else {
                return {
                    success: false
                }
            }
        }

        if (value == null || value === '') return {success: false}

        if(type && type == "string"){
            return {
                success: true,
                value: value,
                dataType: "string"
            }
        }
        if(!type || type == "number"){
            const parsedNumber = this.parseNumber(value)
            if (parsedNumber.success) {
                return {
                    success: true,
                    value: parsedNumber.value,
                    dataType: "number"
                }
            }
        }
        if(!type || type == "date") {
            const parsedDate = this.parseDate(value)
            if (parsedDate.success) {
                return {
                    success: true,
                    value: parsedDate.date,
                    dataType: "date"
                }
            }
        }
        if(!type || typeof value == "string"){
            return {
                success: true,
                value: value,
                dataType: "string"
            }
        }
        return {success: false}
    }

    guessType(data: DataRow[], col: string): DataType {
        let numCount = 0
        let dateCount = 0
        let stringCount = 0
        let stringListCount = 0

        const sampleSize = 20
        let count = 0
        for(let i = 0; i < data.length; i++){
            const value = data[i][col]
            const p = this.parseValue(value)
            if(p.success && p.value != null){
                if(p.dataType == "number"){
                    numCount++
                } else if(p.dataType == "string"){
                    stringCount++
                } else if(p.dataType == "string[]"){
                    stringListCount++
                } else if(p.dataType == "date"){
                    dateCount++
                }
                count ++
                if(count == sampleSize) break
            }
        }

        const maxCount = Math.max(numCount, dateCount, stringCount, stringListCount)

        if (maxCount === 0) return null
        if (maxCount === numCount && dateCount === 0 && stringCount === 0 && stringListCount === 0) {
            return "number"
        }
        if (maxCount === dateCount && numCount === 0 && stringCount === 0 && stringListCount === 0) {
            return "date"
        }
        if (maxCount === stringListCount && numCount === 0 && dateCount === 0 && stringCount == 0) {
            return "string[]"
        }
        return "string"
    }

    rawValueToDetectedType(v: any, type: DataType): ValueType | null {
        const p = this.parseValue(v)
        if(p.success){
            return p.value
        }
        return null
    }

    getDateFormater(sampleDate: Date) {
        const hasMilliseconds = sampleDate.getMilliseconds() !== 0
        const hasSeconds = sampleDate.getSeconds() !== 0
        const hasMinutes = sampleDate.getMinutes() !== 0
        let hasHours = sampleDate.getHours() !== 0
        const hasDay = sampleDate.getDate() !== 1
        const hasMonth = sampleDate.getMonth() !== 0

        if(sampleDate.getHours() == 3 && sampleDate.getMinutes() == 0 && sampleDate.getSeconds() == 0 && sampleDate.getMilliseconds() == 0){
            hasHours = false
        }

        if (hasMilliseconds) {
            return esLocale.format('%d %b %Y %H:%M:%S.%L') // e.g., "13:45:32.123"
        } else if (hasSeconds) {
            return esLocale.format('%d %b %Y %H:%M:%S')    // "13:45:32"
        } else if (hasMinutes || hasHours) {
            return esLocale.format('%d %b %Y %H:%M')       // "13:45"
        } else if (hasDay) {
            return esLocale.format('%d %b %Y')    // "14 jul 2025"
        } else if (hasMonth) {
            return esLocale.format('%b-%Y')       // "jul-2025"
        } else {
            return esLocale.format('%Y')          // "2025"
        }
    }
}