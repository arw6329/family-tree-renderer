import Flex from "@/components/building-blocks/flex/Flex"
import SearchFilter from "../SearchFilter"
import type { FilterDefinition } from "../FilterDefinition"
import ComplexDateInput from "@/components/building-blocks/complex-date-input/ComplexDateInput"

export type DateCompareFilterDefinition = {
    type: 'DATE COMPARE'
    test: string
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
                <ComplexDateInput type="moment" />
            </Flex>
        </SearchFilter>
    )
}

export default DateCompareFilter
