import type { FilterDefinition, FilterType } from "./FilterDefinition"
import { createEmptyFilter } from "./FilterSelection"

const FilterSelectInput: React.FC<{
    onChoose: (filter: FilterDefinition) => void
}> = ({ onChoose }) => {
    return (
        <select onChange={event => {
            onChoose(createEmptyFilter(event.currentTarget.value as FilterType))
            event.currentTarget.value = ''
        }}>
            <option value="">Select a filter</option>
            <optgroup label="Boolean logic">
                <option value="AND">AND</option>
                <option value="OR">OR</option>
                <option value="NOT">NOT</option>
            </optgroup>
            <optgroup label="Value tests">
                <option value="STRING COMPARE">String compare</option>
                <option value="DATE COMPARE">Date compare</option>
            </optgroup>
            <option value="CHILD RECORD">Child record</option>
            <optgroup label="Relatives">
                <option value="PARENTS">Parents</option>
            </optgroup>
        </select>
    )
}

export default FilterSelectInput
