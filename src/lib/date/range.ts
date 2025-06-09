import type { ComplexDate } from "../family-tree/ComplexDate"
import type { ParsedSingleDate } from "../family-tree/gedcom/date-parser"

function getDaysInMonth(year: number, month: number): number {
    const date = new Date
    date.setUTCFullYear(year)
    date.setUTCMonth(month + 1)
    date.setUTCDate(0)
    return date.getUTCDate()
}

function constructUTCDate(year: number, month: number, day: number, hour: number, minute: number, second: number, millisecond: number): Date {
    const date = new Date
    date.setUTCFullYear(year)
    date.setUTCMonth(month)
    date.setUTCDate(day)
    date.setUTCHours(hour)
    date.setUTCMinutes(minute)
    date.setUTCSeconds(second)
    date.setUTCMilliseconds(millisecond)
    return date
}

function singleDateToTimestamp(date: ParsedSingleDate, latestPossible: boolean): number {
    if(latestPossible) {
        if(date.year === null) {
            return Infinity
        }

        const year = (date.bce && date.year !== null ? -1 * (date.year - 1) : date.year)
        return constructUTCDate(
            year,
            date.month ?? 11,
            date.day ?? getDaysInMonth(year, date.month ?? 11),
            23,
            59,
            59,
            999
        ).getTime()
    } else {
        if(date.year === null) {
            return -Infinity
        }

        return constructUTCDate(
            (date.bce && date.year !== null ? -1 * (date.year - 1) : date.year),
            date.month ?? 0,
            date.day ?? 1,
            0,
            0,
            0,
            0
        ).getTime()
    }
}

export function dateToRange(date: ComplexDate): [startTimestamp: number, endTimestamp: number] {
    switch(date.type) {
        case 'date':
        case 'approximate':
        case 'calculated':
        case 'estimated':
        case 'interpreted': {
            const startTimestamp = singleDateToTimestamp(date.date, false)
            const endTimestamp = singleDateToTimestamp(date.date, true)
            return [startTimestamp, endTimestamp]
        }
        case 'period':
        case 'range': {
            const startTimestamp = date.date_start ? singleDateToTimestamp(date.date_start, false) : -Infinity
            const endTimestamp = date.date_end ? singleDateToTimestamp(date.date_end, true) : Infinity
            return [startTimestamp, endTimestamp]
        }
        case 'plaintext': {
            throw new Error(`Cannot convert plaintext date to range`)
        }
        default: {
            throw new Error(`Unrecognized date type ${date.type}`)
        }
    }
}

export function rangesOverlap(range1: [number, number], range2: [number, number]): boolean {
    return range2[1] >= range1[0] && range2[0] <= range1[1]
}
