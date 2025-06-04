import Flex from "@/components/building-blocks/flex/Flex"
import SearchFilter from "../SearchFilter"
import type { FilterDefinition } from "../FilterDefinition"
import { selectFilter } from "../FilterSelection"
import FilterSelectInput from "../FilterSelectInput"

export type ParentsRelativeFilterDefinition = {
    type: 'PARENTS'
    parentFilter1: FilterDefinition | null
    parentFilter2: FilterDefinition | null
    relationshipFilter: FilterDefinition | null
}

const ParentsRelativeFilter: React.FC<{
    filter: ParentsRelativeFilterDefinition
    onChange: (filter: FilterDefinition | null) => void
}> = ({ filter: thisFilter, onChange }) => {
    return (
        <SearchFilter
            operation="RELATIVE - PARENTS"
            color="yellow"
            filter={thisFilter}
            onChange={onChange}
        >
            <Flex column={true} gap={10} alignItems="baseline">
                <span>Individual has any set of parents where one parent matches this filter:</span>
                {thisFilter.parentFilter1
                    ? selectFilter(thisFilter.parentFilter1, filter => {
                        onChange({
                            ...structuredClone(thisFilter),
                            parentFilter1: filter
                        })
                    })
                    : <FilterSelectInput onChoose={filter => {
                        onChange({
                            ...structuredClone(thisFilter),
                            parentFilter1: filter
                        })
                    }} />
                }
                <span>and the other parent matches this filter:</span>
                {thisFilter.parentFilter2
                    ? selectFilter(thisFilter.parentFilter2, filter => {
                        onChange({
                            ...structuredClone(thisFilter),
                            parentFilter2: filter
                        })
                    })
                    : <FilterSelectInput onChoose={filter => {
                        onChange({
                            ...structuredClone(thisFilter),
                            parentFilter2: filter
                        })
                    }} />
                }
                <span>and the relationship matches this filter:</span>
                {thisFilter.relationshipFilter
                    ? selectFilter(thisFilter.relationshipFilter, filter => {
                        onChange({
                            ...structuredClone(thisFilter),
                            relationshipFilter: filter
                        })
                    })
                    : <FilterSelectInput onChoose={filter => {
                        onChange({
                            ...structuredClone(thisFilter),
                            relationshipFilter: filter
                        })
                    }} />
                }
            </Flex>
        </SearchFilter>
    )
}

export default ParentsRelativeFilter
