import Flex from "@/components/building-blocks/flex/Flex"
import SearchFilter from "../SearchFilter"
import type { FilterDefinition, FilterRegistration } from "../filters"
import ComplexDateInput from "@/components/building-blocks/complex-date-input/ComplexDateInput"
import type { ComplexDate } from "@/lib/family-tree/ComplexDate"
import { isComplexDate } from "@/lib/family-tree/date-utils"
import { dateToRange, rangesOverlap } from "@/lib/date/range"

export type DateCompareFilterDefinition = {
    type: 'DATE COMPARE'
    date: ComplexDate | null
}

export const dateCompareFilterRegistration: FilterRegistration<DateCompareFilterDefinition> = {
    type: 'DATE COMPARE',
    createEmpty() {
        return {
            type: 'DATE COMPARE',
            date: null
        }
    },
    execute(filter, testSubject, database): boolean {
        if(!('type' in testSubject)) {
            return false
        }

        // We do not have to deref record here. See comments in child record filter.
        if(testSubject.type === 'pointer') {
            throw new Error(`Did not expect pointer record to appear in filter execution`)
        }
        if(!isComplexDate(testSubject.value)) {
            return false
        }

        if(!filter.date) {
            return false
        }

        return rangesOverlap(dateToRange(filter.date), dateToRange(testSubject.value))
    },
    element(props) {
        return <DateCompareFilter {...props} />
    }
}

const DateCompareFilter: React.FC<{
    filter: DateCompareFilterDefinition
    onChange: (filter: FilterDefinition | null) => void
}> = ({ filter: thisFilter, onChange }) => {
    return (
        <SearchFilter
            operation="DATE COMPARE"
            color="#85b1ff"
            filter={thisFilter}
            onChange={onChange}
        >
            <Flex gap={8} alignItems="center">
                <span>Value is</span>
                <ComplexDateInput
                    enabledModes={['date', 'range', 'range-after', 'range-before']}
                    onChange={date => {
                        onChange({
                            type: 'DATE COMPARE',
                            date
                        })
                    }}
                />
            </Flex>
        </SearchFilter>
    )
}
