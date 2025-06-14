import Flex from "@/components/building-blocks/flex/Flex"
import SearchFilter from "../SearchFilter"
import { createFilterElement, executeFilter, type FilterDefinition, type FilterRegistration } from "../filters"
import FilterSelectInput from "../FilterSelectInput"

export type ParentsRelativeFilterDefinition = {
    type: 'PARENTS'
    parentFilter1: FilterDefinition | null
    parentFilter2: FilterDefinition | null
    relationshipFilter: FilterDefinition | null
}

export const parentsRelativeFilterRegistration: FilterRegistration<ParentsRelativeFilterDefinition> = {
    type: 'PARENTS',
    createEmpty() {
        return {
            type: 'PARENTS',
            parentFilter1: {
                type: 'NO-OP'
            },
            parentFilter2: {
                type: 'NO-OP'
            },
            relationshipFilter: {
                type: 'NO-OP'
            }
        }
    },
    *execute(filter, testSubject, database, variableStore): Generator<boolean, undefined, undefined> {
        if(!('profile_id' in testSubject)) {
            yield false
            return
        }

        const parents = database.getParentsOf(testSubject)
        for(const { parent1, parent2, childRelationship } of parents) {
            for(const resultp1 of executeFilter(filter.parentFilter1, parent1, database, variableStore)) {
                for(const resultp2 of executeFilter(filter.parentFilter2, parent2, database, variableStore)) {
                    for(const resultcr of executeFilter(filter.relationshipFilter, childRelationship, database, variableStore)) {
                        yield resultp1 && resultp2 && resultcr
                    }
                }
            }

            for(const resultp2 of executeFilter(filter.parentFilter1, parent2, database, variableStore)) {
                for(const resultp1 of executeFilter(filter.parentFilter2, parent1, database, variableStore)) {
                    for(const resultcr of executeFilter(filter.relationshipFilter, childRelationship, database, variableStore)) {
                        yield resultp1 && resultp2 && resultcr
                    }
                }
            }
        }
    },
    element(props) {
        return <ParentsRelativeFilter {...props} />
    }
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
                    ? createFilterElement({
                        filter: thisFilter.parentFilter1,
                        testSubjectType: 'Profile',
                        onChange(filter) {
                            onChange({
                                ...structuredClone(thisFilter),
                                parentFilter1: filter
                            })
                        }
                    })
                    : <FilterSelectInput testSubjectType="Profile" onChoose={filter => {
                        onChange({
                            ...structuredClone(thisFilter),
                            parentFilter1: filter
                        })
                    }} />
                }
                <span>and the other parent matches this filter:</span>
                {thisFilter.parentFilter2
                    ? createFilterElement({
                        filter: thisFilter.parentFilter2,
                        testSubjectType: 'Profile',
                        onChange(filter) {
                            onChange({
                                ...structuredClone(thisFilter),
                                parentFilter2: filter
                            })
                        }
                    })
                    : <FilterSelectInput testSubjectType="Profile" onChoose={filter => {
                        onChange({
                            ...structuredClone(thisFilter),
                            parentFilter2: filter
                        })
                    }} />
                }
                <span>and the relationship matches this filter:</span>
                {thisFilter.relationshipFilter
                    ? createFilterElement({
                        filter: thisFilter.relationshipFilter,
                        testSubjectType: 'ChildRelationship',
                        onChange(filter) {
                            onChange({
                                ...structuredClone(thisFilter),
                                relationshipFilter: filter
                            })
                        }
                    })
                    : <FilterSelectInput testSubjectType="ChildRelationship" onChoose={filter => {
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
