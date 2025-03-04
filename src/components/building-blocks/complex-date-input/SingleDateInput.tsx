import { ParsedSingleDate } from "@/lib/family-tree/gedcom/date-parser"
import { useState } from "react"
import "./SingleDateInput.scoped.css"

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const

// onChange will report null on completely empty dates
const SingleDateInput: React.FC<{ defaultValue?: ParsedSingleDate | null, onChange?: (date: ParsedSingleDate | null) => void }> = ({ defaultValue, onChange }) => {
    const [month, _setMonth] = useState<number | null>(defaultValue?.month ?? null)
    const [day, _setDay] = useState<number | null>(defaultValue?.day ?? null)
    const [year, _setYear] = useState<number | null>(defaultValue?.year ?? null)

    function setMonth(month: number | null) {
        reportChange(year, month, day)
        _setMonth(month)
    }

    function setDay(day: number | null) {
        reportChange(year, month, day)
        _setDay(day)
    }

    function setYear(year: number | null) {
        reportChange(year, month, day)
        _setYear(year)
    }

    function reportChange(year: number | null, month: number | null, day: number | null) {
        const date = {
            year,
            month,
            day,
            bce: false
        }

        if(date.year === null && date.month === null && date.day === null) {
            onChange?.(null)
        } else {
            onChange?.(date)
        }
    }

    return (
        <div className="single-date-input">
            <select
                className="month-input"
                defaultValue={defaultValue?.month ? months[defaultValue.month] : undefined}
                onChange={(event) => setMonth(months.includes(event.target.value) ? months.indexOf(event.target.value) : null)}
            >
                <option></option>
                <option>January</option>
                <option>February</option>
                <option>March</option>
                <option>April</option>
                <option>May</option>
                <option>June</option>
                <option>July</option>
                <option>August</option>
                <option>September</option>
                <option>October</option>
                <option>November</option>
                <option>December</option>
            </select>
            <input
                type="number"
                className="day-input"
                placeholder="dd"
                min="1"
                max="31"
                step="1"
                defaultValue={defaultValue?.day ?? undefined}
                onChange={(event) => setDay(parseInt(event.target.value) || null)}
            />
            <input
                type="number"
                className="year-input"
                placeholder="yyyy"
                min="1"
                max="9999"
                step="1"
                defaultValue={defaultValue?.year ?? undefined}
                onChange={(event) => setYear(parseInt(event.target.value) || null)}
            />
        </div>
    )
}

export default SingleDateInput
