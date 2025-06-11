import SearchFilter from "../SearchFilter"
import type { FilterDefinition, FilterRegistration } from "../filters"

export type NoopFilterDefinition = {
    type: 'NO-OP'
}

export const noopFilterRegistration: FilterRegistration<NoopFilterDefinition> = {
    type: 'NO-OP',
    createEmpty() {
        return {
            type: 'NO-OP',
        }
    },
    *execute(): Generator<boolean, undefined, undefined> {
        yield true
    },
    element(props) {
        return <NoopFilter {...props} />
    }
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
