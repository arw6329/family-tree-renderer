import Flex from "@/components/building-blocks/flex/Flex"
import SearchFilter from "../SearchFilter"
import type { FilterDefinition } from "../FilterDefinition"

export type StringCompareFilterDefinition = {
    type: 'STRING COMPARE'
    operation: 'equals' | 'contains' | 'starts-with' | 'ends-with' | 'regex'
    test: string
}

const StringCompareFilter: React.FC<{
    filter: StringCompareFilterDefinition
    onChange: (filter: FilterDefinition | null) => void
}> = ({ filter: thisFilter, onChange }) => {
    return (
        <SearchFilter
            operation="STRING COMPARE"
            color="#85b1ff"
            filter={thisFilter}
            onChange={onChange}
        >
            <Flex gap={8} alignItems="center">
                <span>Value</span>
                <select defaultValue={thisFilter.operation} onChange={event => {
                    onChange({
                        type: 'STRING COMPARE',
                        operation: event.currentTarget.value as StringCompareFilterDefinition['operation'],
                        test: thisFilter.test
                    })
                }}>
                    <option value="equals">Is exactly</option>
                    <option value="contains">Contains string</option>
                    <option value="starts-with">Starts with string</option>
                    <option value="ends-with">Ends with string</option>
                    <option value="regex">Matches regex</option>
                </select>
                <input type="text" placeholder="Filter" defaultValue={thisFilter.test} onChange={event => {
                    onChange({
                        type: 'STRING COMPARE',
                        operation: thisFilter.operation,
                        test: event.currentTarget.value
                    })
                }} />
            </Flex>
        </SearchFilter>
    )
}

export default StringCompareFilter
