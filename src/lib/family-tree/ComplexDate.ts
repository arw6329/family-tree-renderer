import type { ParsedSingleDate } from "./gedcom/date-parser"

export type ComplexDate = {
    type: 'date' | 'approximate' | 'calculated' | 'estimated',
    date: ParsedSingleDate
} | {
    type: 'period' | 'range',
    date_start: ParsedSingleDate,
    date_end: ParsedSingleDate
} | {
    type: 'period' | 'range',
    date_start: ParsedSingleDate,
    date_end: null
} | {
    type: 'period' | 'range',
    date_start: null,
    date_end: ParsedSingleDate
} | {
    type: 'interpreted',
    date: ParsedSingleDate,
    text: string
} | {
    type: 'plaintext',
    text: string
}
