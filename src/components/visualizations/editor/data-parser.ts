import {DataRow, DataType, esLocale, ValueType} from "@/components/visualizations/editor/plotter";
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import 'dayjs/locale/es'
import 'dayjs/locale/en'

dayjs.extend(customParseFormat)


const customDateFormats = [
    "MMM-YY",
    "MMMM-YY",
    'DD/MM/YYYY',
    'MM/DD/YYYY',
    'DD-MM-YYYY',
    'MM-DD-YYYY',
    'YYYY/MM/DD',
    'MMM D, YYYY',
]

const locales = ['es', 'en']


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
        for (const format of customDateFormats) {
            for (const locale of locales) {
                const parsed = dayjs(value, format, locale, false)
                if (parsed.isValid()) {
                    return {
                        success: true,
                        date: parsed.toDate()
                    }
                }
            }
        }

        const date = new Date(value)
        if(!isNaN(date.getTime())){
            return {success: true, date}
        }

        return {success: false}
    }

    parseNumber(value: any): {success: true, value: number} | {success: false} {
        if(typeof value == "string"){
            let num: number
            if(value.includes(",")){
                num = Number(value.replace(".", "").replace(",", "."))
            } else {
                num = Number(value)
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

    parseValue(value: any): ParsingResult {
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

        const parsedNumber = this.parseNumber(value)
        if (parsedNumber.success) {
            return {
                success: true,
                value: parsedNumber.value,
                dataType: "number"
            }
        }
        const parsedDate = this.parseDate(value)
        if (parsedDate.success) {
            return {
                success: true,
                value: parsedDate.date,
                dataType: "date"
            }
        }

        if(typeof value == "string"){
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

        const sampleSize = Math.min(20, data.length)
        for (let i = 0; i < sampleSize; i++) {
            const value = data[i][col]
            const p = this.parseValue(value)
            if(p.success){
                if(p.dataType == "number"){
                    numCount++
                } else if(p.dataType == "string"){
                    stringCount++
                } else if(p.dataType == "string[]"){
                    stringListCount++
                } else if(p.dataType == "date"){
                    dateCount++
                }
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
        const hasHours = sampleDate.getHours() !== 0
        const hasDay = sampleDate.getDate() !== 1
        const hasMonth = sampleDate.getMonth() !== 0

        if (hasMilliseconds) {
            return esLocale.format('%H:%M:%S.%L') // e.g., "13:45:32.123"
        } else if (hasSeconds) {
            return esLocale.format('%H:%M:%S')    // "13:45:32"
        } else if (hasMinutes || hasHours) {
            return esLocale.format('%H:%M')       // "13:45"
        } else if (hasDay) {
            return esLocale.format('%d %b %Y')    // "14 jul 2025"
        } else if (hasMonth) {
            return esLocale.format('%b-%Y')       // "jul-2025"
        } else {
            return esLocale.format('%Y')          // "2025"
        }
    }
}