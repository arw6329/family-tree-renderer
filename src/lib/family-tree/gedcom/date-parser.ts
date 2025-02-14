import { ComplexDate } from "../ComplexDate"

const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'] as const

type GedcomMonthIdent = typeof months[number]

export type ParsedSingleDate = {
    year: number | null,
    month: number | null,
    day: number | null,
    bce: boolean
}

function gedcomMonthToIndex(str: GedcomMonthIdent) {
    return months.indexOf(str)
}

function uppercaseMatches(array: RegExpExecArray | null) {
	if(!array) {
		return null
	}

	return array.map(elem => typeof elem === 'string' ? elem.toUpperCase() : elem)
}

function parseSingleDate(str: string) {
	const unsupportedCalendar = /^@#D(?!GREGORIAN@)([^@]+)@/i.exec(str)
	if(unsupportedCalendar) {
		console.log(`Calendar ${unsupportedCalendar[1]} not supported for date ${str}`)
		return null
	}

	const yearBCE = /^(?:@#DGREGORIAN@\s+)?(?<year>\d+)(?:\s+(BCE|BC|B\.C\.))?$/i.exec(str) as [string, string, string | undefined] | null

    if(yearBCE) {
        return {
            year: parseInt(yearBCE[1]),
            month: null,
            day: null,
            bce: !!yearBCE[2]
        }
    }

	const monthYear = uppercaseMatches(/^(?:@#DGREGORIAN@\s+)?(?<month>JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+(?<year>\d+)$/i.exec(str)) as [string, GedcomMonthIdent, string] | null

    if(monthYear) {
        return {
            year: parseInt(monthYear[2]),
            month: gedcomMonthToIndex(monthYear[1]),
            day: null,
            bce: false
        }
    }

	const dayMonthYear = uppercaseMatches(/^(?:@#DGREGORIAN@\s+)?(?<day>\d+)\s+(?<month>JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+(?<year>\d+)$/i.exec(str)) as [string, string, GedcomMonthIdent, string] | null

    if(dayMonthYear) {
        return {
            year: parseInt(dayMonthYear[3]),
            month: gedcomMonthToIndex(dayMonthYear[2]),
            day: parseInt(dayMonthYear[1]),
            bce: false
        }
    }

	const dayMonth = uppercaseMatches(/^(?:@#DGREGORIAN@\s+)?(?<day>\d+)\s+(?<month>JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)$/i.exec(str)) as [string, string, GedcomMonthIdent] | null

    if(dayMonth) {
        return {
            year: null,
            month: gedcomMonthToIndex(dayMonth[2]),
            day: parseInt(dayMonth[1]),
            bce: false
        }
    }

    return null
}

function _parseGedcomDate(str: string) {
    if(str.startsWith('(') && str.endsWith(')')) {
        return {
            type: 'plaintext',
            text: str.slice(1, -1)
        } as const
    }

    const plainDate = parseSingleDate(str)

    if(plainDate) {
        return {
            type: 'date',
            date: plainDate
        } as const
    }

	const approxDate = uppercaseMatches(/^(ABT|CAL|EST)\s+(.+)$/i.exec(str)) as [string, 'ABT' | 'CAL' | 'EST', string] | null

	if(approxDate) {
		const date = parseSingleDate(approxDate[2])

		return date ? {
			type: ({
				ABT: 'approximate',
				CAL: 'calculated',
				EST: 'estimated'
			} as const)[approxDate[1]],
			date: date
		} as const : null
	}

	const datePeriod = /^FROM\s+(.+)\s+TO\s+(.+)$/i.exec(str) as [string, string, string] | null

	if(datePeriod) {
		const dateStart = parseSingleDate(datePeriod[1])
		const dateEnd = parseSingleDate(datePeriod[2])

		return dateStart && dateEnd ? {
			type: 'period',
			date_start: dateStart,
			date_end: dateEnd
		} as const : null
	}

	const datePeriodStartOnly = /^FROM\s+(.+)$/i.exec(str) as [string, string] | null

    if(datePeriodStartOnly) {
		const dateStart = parseSingleDate(datePeriodStartOnly[1])

		return dateStart ? {
			type: 'period',
			date_start: dateStart,
			date_end: null
		} as const : null
	}

	const datePeriodEndOnly = /^TO\s+(.+)$/i.exec(str) as [string, string] | null

    if(datePeriodEndOnly) {
		const dateEnd = parseSingleDate(datePeriodEndOnly[1])

		return dateEnd ? {
			type: 'period',
			date_start: null,
			date_end: dateEnd
		} as const : null
	}

	const dateRange = /^BET\s+(.+)\s+AND\s+(.+)$/i.exec(str) as [string, string, string] | null

    if(dateRange) {
		const dateStart = parseSingleDate(dateRange[1])
        const dateEnd = parseSingleDate(dateRange[2])

		return dateStart && dateEnd ? {
			type: 'range',
			date_start: dateStart,
			date_end: dateEnd
		} as const : null
	}

	const dateRangeBefore = /^BEF\s+(.+)$/i.exec(str) as [string, string] | null

    if(dateRangeBefore) {
		const dateEnd = parseSingleDate(dateRangeBefore[1])

		return dateEnd ? {
			type: 'range',
			date_start: null,
			date_end: dateEnd
		} as const : null
	}
    
	const dateRangeAfter = /^AFT\s+(.+)$/i.exec(str) as [string, string] | null

    if(dateRangeAfter) {
		const dateStart = parseSingleDate(dateRangeAfter[1])

		return dateStart ? {
			type: 'range',
			date_start: dateStart,
			date_end: null
		} as const : null
	}

	const interpretedDate = /^INT\s+(.+)\s+\((.+)\)$/i.exec(str) as [string, string, string] | null

    if(interpretedDate) {
		const date = parseSingleDate(interpretedDate[1])

		return date ? {
			type: 'interpreted',
			date: date,
			text: interpretedDate[2]
		} as const : null
	}

    return null
}

export function parseGedcomDate(str: string): ComplexDate {
    return _parseGedcomDate(str) ?? {
        type: 'plaintext',
        text: str
    }
}