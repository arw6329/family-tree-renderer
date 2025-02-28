import { ComplexDate } from "./ComplexDate"
import { ParsedSingleDate } from "./gedcom/date-parser"

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function prettySingleDate(date: ParsedSingleDate): string {
    const needsComma = date.year !== null && date.month !== null && date.day !== null
    const parts = [date.month !== null ? months[date.month] : null, needsComma ? `${date.day},` : date.day, date.year, date.bce ? 'BCE' : null].filter(part => part != null)
    return parts.join(' ')
}

export function prettyDate(date: ComplexDate): string {
    switch(date.type) {
        case 'date':
            return prettySingleDate(date.date)
        case 'approximate':
            return prettySingleDate(date.date) + ' (approximate)'
        case 'calculated':
            return prettySingleDate(date.date) + ' (calculated)'
        case 'estimated':
            return prettySingleDate(date.date) + ' (estimated)'
        case 'interpreted':
            return prettySingleDate(date.date) + ` (interpreted from ${date.text})`
        case 'period':
            if(date.date_start && date.date_end) {
                return `From ${prettySingleDate(date.date_start)} to ${prettySingleDate(date.date_end)}`
            } else if(date.date_start) {
                return `From ${prettySingleDate(date.date_start)} to an unknown date`
            } else {
                return `From an unknown date to ${prettySingleDate(date.date_end)}`
            }
        case 'range':
            if(date.date_start && date.date_end) {
                return `Some time between ${prettySingleDate(date.date_start)} and ${prettySingleDate(date.date_end)}`
            } else if(date.date_start) {
                return `Some time after ${prettySingleDate(date.date_start)}`
            } else {
                return `Some time before ${prettySingleDate(date.date_end)}`
            }
        case 'plaintext':
            return date.text
        default:
            return `Unexpected date type`
    }
}

export function prettyDateShortYearOnly(date: ComplexDate): string | null {
    switch(date.type) {
        case 'date':
        case 'approximate':
        case 'calculated':
        case 'estimated':
        case 'interpreted': {
            return date.date.year?.toString() ?? null
        }
        case 'range': {
            if(date.date_start?.year && date.date_end?.year) {
                return `~${Math.floor((date.date_start.year + date.date_end.year) / 2)}`
            } else if(date.date_start?.year) {
                return `>${date.date_start.year}`
            } else if(date.date_end?.year) {
                return `<${date.date_end.year}`
            } else {
                return null
            }
        }
        case 'period':
        case 'plaintext':
        default: {
            return null
        }
    }
}

export function isComplexDate(date: unknown): date is ComplexDate {
    // TODO: actually implement
    return true
}
