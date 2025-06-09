import type { FilterDefinition, FilterTestSubjectType, FilterType } from "./FilterDefinition"
import { createEmptyFilter } from "./FilterSelection"

const FilterSelectInput: React.FC<{
    testSubjectType: FilterTestSubjectType
    onChoose: (filter: FilterDefinition) => void
}> = ({ testSubjectType, onChoose }) => {
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
            {testSubjectType === 'NodeMetadata' && <>
                <optgroup label="Value tests">
                    <option value="STRING COMPARE">String compare</option>
                    <option value="DATE COMPARE">Date compare</option>
                </optgroup>
                <optgroup label="Metadata">
                    <option value="CHILD RECORD">Child record</option>
                </optgroup>
            </>}
            {testSubjectType === 'Profile' && <>
                <optgroup label="Relatives">
                    <option value="PARENTS">Parents</option>
                </optgroup>
                <optgroup label="Metadata">
                    <option value="CHILD RECORD">Child record</option>
                </optgroup>
            </>}
        </select>
    )
}

export default FilterSelectInput
