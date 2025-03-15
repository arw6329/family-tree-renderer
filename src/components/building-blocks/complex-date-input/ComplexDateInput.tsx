import React, { useState } from "react"
import "./ComplexDateInput.scoped.css"
import { ComplexDate } from "@/lib/family-tree/ComplexDate"
import { ParsedSingleDate } from "@/lib/family-tree/gedcom/date-parser"
import SingleDateInput from "./SingleDateInput"

function reportChange(mode: string, date1: ParsedSingleDate | null, date2: ParsedSingleDate | null, onChange?: (date: ComplexDate | null) => void) {
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
const ComplexDateInput: React.FC<{ type: 'moment' | 'timespan', defaultValue?: ComplexDate | null, onChange?: (date: ComplexDate | null) => void }> = ({ type, defaultValue, onChange }) => {
    const _defaultValue = defaultValue ?? { type: 'date', date: null }
    let initialMode: string
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
                initialMode = _defaultValue.type + '-before'
                initialDate1 = _defaultValue.date_end
                initialDate2 = null
            } else if((_defaultValue as PeriodOrRangeDate).date_end === null) {
                initialMode = _defaultValue.type + '-after'
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
    
    const [mode, _setMode] = useState(initialMode)
    const [date1, _setDate1] = useState(initialDate1)
    const [date2, _setDate2] = useState(initialDate2)

    function setMode(mode: string) {
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
            <select defaultValue={mode} onChange={(event) => setMode(event.target.value)}>
                {type === 'moment'
                    ? <>
                        <optgroup label="Single dates">
                            <option value="date">Exactly</option>
                            <option value="approximate">Approximately</option>
                        </optgroup>
                        <optgroup label="Date ranges">
                            <option value="range">Between</option>
                            <option value="range-after">After</option>
                            <option value="range-before">Before</option>
                        </optgroup>
                    </> : <>
                        <optgroup label="Time intervals">
                            <option value="period">Time span</option>
                            <option value="period-after">Time span - end unknown</option>
                            <option value="period-before">Time span - start unknown</option>
                        </optgroup>
                    </>}
                <option value="plaintext">Plain text</option>
            </select>
            {input}
        </div>
    )
}

export default ComplexDateInput
