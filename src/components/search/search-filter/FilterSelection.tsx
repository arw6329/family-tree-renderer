import type { ReactNode } from "react"
import type { FilterDefinition, FilterTestSubjectType, FilterType } from "./FilterDefinition"
import AndFilter from "./filter-elements/AndFilter"
import NotFilter from "./filter-elements/NotFilter"
import ChildRecordFilter from "./filter-elements/ChildRecordFilter"
import StringCompareFilter from "./filter-elements/StringCompareFilter"
import DateCompareFilter from "./filter-elements/DateCompareFilter"
import ParentsRelativeFilter from "./filter-elements/ParentsRelativeFilter"
import NoopFilter from "./filter-elements/NoopFilter"

export function selectFilter(filter: FilterDefinition, testSubjectType: FilterTestSubjectType, onChange: (filter: FilterDefinition | null) => void): ReactNode {
    switch(filter.type) {
        case 'AND':
        case 'OR': {
            return <AndFilter filter={filter} testSubjectType={testSubjectType} onChange={onChange} />
        }
        case 'NOT': {
            return <NotFilter filter={filter} testSubjectType={testSubjectType} onChange={onChange} />
        }
        case 'CHILD RECORD': {
            return <ChildRecordFilter filter={filter} onChange={onChange} />
        }
        case 'PARENTS': {
            return <ParentsRelativeFilter filter={filter} onChange={onChange} />
        }
        case 'STRING COMPARE': {
            return <StringCompareFilter filter={filter} onChange={onChange} />
        }
        case 'DATE COMPARE': {
            return <DateCompareFilter filter={filter} onChange={onChange} />
        }
        case 'NO-OP': {
            return <NoopFilter filter={filter} onChange={onChange} />
        }
        default: {
            throw new Error(`Unrecognized filter type ${filter.type}: `, filter)
        }
    }
}

export function createEmptyFilter(type: FilterType): FilterDefinition {
    switch(type) {
        case 'AND':
        case 'OR': {
            return {
                type: type,
                filters: []
            }
        }
        case 'NOT': {
            return {
                type: 'NOT',
                filter: {
                    type: 'NO-OP'
                }
            }
        }
        case 'CHILD RECORD': {
            return {
                type: 'CHILD RECORD',
                cardinality: 'any',
                childKey: '',
                filter: {
                    type: 'NO-OP'
                }
            }
        }
        case 'PARENTS': {
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
        }
        case 'STRING COMPARE': {
            return {
                type: 'STRING COMPARE',
                operation: 'equals',
                test: ''
            }
        }
        case 'DATE COMPARE': {
            return {
                type: 'DATE COMPARE',
                test: ''
            }
        }
        case 'NO-OP': {
            return {
                type: 'NO-OP'
            }
        }
        default: {
            throw new Error(`Unrecognized filter type ${type}`)
        }
    }
}
