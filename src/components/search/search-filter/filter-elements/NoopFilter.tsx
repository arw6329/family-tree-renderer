import SearchFilter from "../SearchFilter"
import type { FilterDefinition } from "../FilterDefinition"

export type NoopFilterDefinition = {
    type: 'NO-OP'
}

const NoopFilter: React.FC<{
    filter: NoopFilterDefinition
    onChange: (filter: FilterDefinition | null) => void
}> = ({ filter: thisFilter, onChange }) => {
    return (
        <SearchFilter
            operation="NO-OP"
            color="#7e7e7e"
            filter={thisFilter}
            onChange={onChange}
            allowWraps={false}
        >
            <span>No-op: filter always matches</span>
        </SearchFilter>
    )
}

export default NoopFilter
