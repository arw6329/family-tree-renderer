import Flex from "@/components/building-blocks/flex/Flex"
import SearchFilter from "../SearchFilter"
import type { FilterDefinition } from "../FilterDefinition"
import ComplexDateInput from "@/components/building-blocks/complex-date-input/ComplexDateInput"
import type { ComplexDate } from "@/lib/family-tree/ComplexDate"

export type DateCompareFilterDefinition = {
    type: 'DATE COMPARE'
    date: ComplexDate | null
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

export default DateCompareFilter
