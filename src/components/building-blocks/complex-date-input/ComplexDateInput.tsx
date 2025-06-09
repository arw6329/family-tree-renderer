import React, { useState } from "react"
import "./ComplexDateInput.scoped.css"
import { ComplexDate } from "@/lib/family-tree/ComplexDate"
import { ParsedSingleDate } from "@/lib/family-tree/gedcom/date-parser"
import SingleDateInput from "./SingleDateInput"

type ComplexDateInputMode = 'date' | 'approximate' | 'range-after' | 'range-before' | 'range' | 'period' | 'period-after' | 'period-before' | 'plaintext'

function reportChange(mode: ComplexDateInputMode, date1: ParsedSingleDate | null, date2: ParsedSingleDate | null, onChange?: (date: ComplexDate | null) => void) {
    switch(mode) {
        case 'date':
        case 'approximate': {
            if(date1 === null) {
                onChange?.(null)
            } else {
                onChange?.({
                    type: mode,
                    date: date1
                })
            }
            break
        }
        case 'range-after': {
            if(date1 === null) {
                onChange?.(null)
            } else {
                onChange?.({
                    type: 'range',
                    date_start: date1,
                    date_end: null
                })
            }
            break
        }
        case 'range-before': {
            if(date1 === null) {
                onChange?.(null)
            } else {
                onChange?.({
                    type: 'range',
                    date_start: null,
                    date_end: date1
                })
            }
            break
        }
        case 'range':
        case 'period': {
            if(date1 === null && date2 === null) {
                onChange?.(null)
            } else {
                onChange?.({
                    type: mode,
                    date_start: date1,
                    date_end: date2
                } as ComplexDate)
            }
            break
        }
        case 'period-after': {
            if(date1 === null) {
                onChange?.(null)
            } else {
                onChange?.({
                    type: 'period',
                    date_start: date1,
                    date_end: null
                })
            }
            break
        }
        case 'period-before': {
            if(date1 === null) {
                onChange?.(null)
            } else {
                onChange?.({
                    type: 'period',
                    date_start: null,
                    date_end: date1
                })
            }
            break
        }
        case 'plaintext': {
            throw new Error('Not implemented')
            break
        }
    }
}

// onChange will report null on completely empty date
const ComplexDateInput: React.FC<{
    enabledModes: 'moment' | 'timespan' | ComplexDateInputMode[]
    defaultValue?: ComplexDate | null
    onChange?: (date: ComplexDate | null) => void
}> = ({ enabledModes: propEnabledModes, defaultValue, onChange }) => {
    const _defaultValue = defaultValue ?? { type: 'date', date: null }
    const enabledModes =
        propEnabledModes === 'timespan'
            ? [ 'period', 'period-after', 'period-before', 'plaintext' ]
        : propEnabledModes === 'moment'
            ? [ 'date', 'approximate', 'range', 'range-after', 'range-before', 'plaintext' ]
            : propEnabledModes
    let initialMode: ComplexDateInputMode
    let initialDate1: ParsedSingleDate | null
    let initialDate2: ParsedSingleDate | null

    // TODO: support the other options or just remove them
    switch(_defaultValue.type) {
        case 'date':
        case 'approximate': {
            initialMode = _defaultValue.type
            initialDate1 = _defaultValue.date
            initialDate2 = null
            break
        }
        case 'period':
        case 'range': {
            type PeriodOrRangeDate = ComplexDate & { type: 'period' | 'range' }
            if((_defaultValue as PeriodOrRangeDate).date_start === null) {
                initialMode = `${_defaultValue.type}-before`
                initialDate1 = _defaultValue.date_end
                initialDate2 = null
            } else if((_defaultValue as PeriodOrRangeDate).date_end === null) {
                initialMode = `${_defaultValue.type}-after`
                initialDate1 = _defaultValue.date_start
                initialDate2 = null
            } else {
                initialMode = _defaultValue.type
                initialDate1 = _defaultValue.date_start
                initialDate2 = _defaultValue.date_end
            }
            break
        }
        case 'plaintext': {
            initialMode = 'plaintext'
            initialDate1 = null
            initialDate2 = null
            break
        }
        default: {
            throw new Error(`Date type ${_defaultValue.type} not supported`)
        }
    }
    
    const [mode, _setMode] = useState<ComplexDateInputMode>(initialMode)
    const [date1, _setDate1] = useState(initialDate1)
    const [date2, _setDate2] = useState(initialDate2)

    function setMode(mode: ComplexDateInputMode) {
        reportChange(mode, date1, date2, onChange)
        _setMode(mode)
    }

    function setDate1(date1: ParsedSingleDate | null) {
        reportChange(mode, date1, date2, onChange)
        _setDate1(date1)
    }

    function setDate2(date2: ParsedSingleDate | null) {
        reportChange(mode, date1, date2, onChange)
        _setDate2(date2)
    }

    const input = (() => {
        switch(mode) {
            case 'date':
            case 'approximate':
            case 'range-after': 
            case 'range-before': {
                return <SingleDateInput defaultValue={date1} onChange={(date) => setDate1(date)} />
            }
            case 'range': {
                return <>
                    <SingleDateInput defaultValue={date1} onChange={(date) => setDate1(date)} />
                    <span>and</span>
                    <SingleDateInput defaultValue={date2} onChange={(date) => setDate2(date)} />
                </>
            }
            case 'period': {
                return <>
                    <span>From</span>
                    <SingleDateInput defaultValue={date1} onChange={(date) => setDate1(date)} />
                    <span>to</span>
                    <SingleDateInput defaultValue={date2} onChange={(date) => setDate2(date)} />
                </>
            }
            case 'period-after': {
                return <>
                    <span>From</span>
                    <SingleDateInput defaultValue={date1} onChange={(date) => setDate1(date)} />
                    <span>to an unknown date</span>
                </>
            }
            case 'period-before': {
                return <>
                    <span>From an unknown date to</span>
                    <SingleDateInput defaultValue={date1} onChange={(date) => setDate1(date)} />
                </>
            }
            case 'plaintext': {
                return <input type="text" />
            }
        }
    })()

    return (
        <div className="root">
            <select defaultValue={mode} onChange={(event) => setMode(event.target.value as ComplexDateInputMode)}>
                {['date', 'approximate'].some(mode => enabledModes.includes(mode)) && <optgroup label="Single dates">
                    {enabledModes.includes('date')        && <option value="date">Exactly</option>}
                    {enabledModes.includes('approximate') && <option value="approximate">Approximately</option>}
                </optgroup>}
                {['range', 'range-after', 'range-before'].some(mode => enabledModes.includes(mode)) && <optgroup label="Date ranges">
                    {enabledModes.includes('range')        && <option value="range">Between</option>}
                    {enabledModes.includes('range-after')  && <option value="range-after">After</option>}
                    {enabledModes.includes('range-before') && <option value="range-before">Before</option>}
                </optgroup>}
                {['period', 'period-after', 'period-before'].some(mode => enabledModes.includes(mode)) && <optgroup label="Time intervals">
                    {enabledModes.includes('period')        && <option value="period">Time span</option>}
                    {enabledModes.includes('period-after')  && <option value="period-after">Time span - end unknown</option>}
                    {enabledModes.includes('period-before') && <option value="period-before">Time span - start unknown</option>}
                </optgroup>}
                {enabledModes.includes('plaintext') && <option value="plaintext">Plain text</option>}
            </select>
            {input}
        </div>
    )
}

export default ComplexDateInput
