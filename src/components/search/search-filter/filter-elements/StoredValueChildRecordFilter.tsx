import Flex from "@/components/building-blocks/flex/Flex"
import SearchFilter from "../SearchFilter"
import { createFilterElement, type FilterRegistration, type FilterDefinition, executeFilter } from "../filters"
import HeaderButton from "@/components/building-blocks/header-button/HeaderButton"
import { IconContext } from "react-icons"
import { LuReplace } from "react-icons/lu"
import FilterSelectInput from "../FilterSelectInput"
import type { NodeMetadata } from "@/lib/family-tree/FamilyTreeDatabase"

export type StoredValueChildRecordFilterDefinition = {
    type: 'CHILD RECORD STORED'
    cardinality: 'any' | 'first'
    childKey: string
    filter: FilterDefinition | null
    variable: string
}

export const storedValueChildRecordFilterRegistration: FilterRegistration<StoredValueChildRecordFilterDefinition> = {
    type: 'CHILD RECORD STORED',
    createEmpty() {
        return {
            type: 'CHILD RECORD STORED',
            cardinality: 'any',
            childKey: '',
            filter: {
                type: 'NO-OP'
            },
            variable: ''
        }
    },
    *execute(filter, testSubject, database, variableStore): Generator<boolean, undefined, undefined> {
        const children = ('metadata' in testSubject
            ? database.getDereferencedMetadata(testSubject)
            : testSubject.children) as (NodeMetadata & { type: 'simple' })[]
        
        for(const child of children) {
            if(child.key !== filter.childKey) {
                continue
            }

            for(const result of executeFilter(filter.filter, child, database, variableStore)) {
                if(result) {
                    variableStore.setVariable(filter.variable, child.value)
                    yield result
                }
                if(filter.cardinality === 'first') {
                    return
                }
            }
        }
    },
    element(props) {
        return <StoredValueChildRecordFilter {...props} />
    }
}

const StoredValueChildRecordFilter: React.FC<{
    filter: StoredValueChildRecordFilterDefinition
    onChange: (filter: FilterDefinition | null) => void
}> = ({ filter: thisFilter, onChange }) => {
    return (
        <SearchFilter
            operation="CHILD RECORD - STORE VALUE"
            color="#b66cff"
            filter={thisFilter}
            onChange={onChange}
            extraControlButtons={thisFilter.filter && ('filter' in thisFilter.filter || 'filters' in thisFilter.filter) &&
                <HeaderButton
                    imageButton={true}
                    tooltip="Replace with child"
                    tooltipSide="left"
                    onClick={() => {
                        onChange(structuredClone(thisFilter.filter))
                    }}
                >
                    <IconContext.Provider value={{ style: { height: 20, width: 20, transform: 'scaleY(-1)' } }}>
                        <LuReplace />
                    </IconContext.Provider>
                </HeaderButton>
            }
        >
            <Flex column={true} gap={10} alignItems="baseline">
                <Flex gap={8} alignItems="center">
                    <span>Object has</span>
                    <select defaultValue={thisFilter.cardinality} onChange={event => {
                        onChange({
                            type: 'CHILD RECORD STORED',
                            cardinality: event.currentTarget.value as StoredValueChildRecordFilterDefinition['cardinality'],
                            childKey: thisFilter.childKey,
                            filter: structuredClone(thisFilter.filter),
                            variable: thisFilter.variable
                        })
                    }}>
                        <option value="any">Any</option>
                        <option value="first">First</option>
                    </select>
                    <input
                        type="text"
                        placeholder="eg. BIRTH"
                        defaultValue={thisFilter.childKey}
                        onChange={event => {
                            onChange({
                                type: 'CHILD RECORD STORED',
                                cardinality: thisFilter.cardinality,
                                childKey: event.currentTarget.value,
                                filter: structuredClone(thisFilter.filter),
                                variable: thisFilter.variable
                            })
                        }}
                        style={{ maxWidth: 60 }}
                    />
                    <span>record matching this filter:</span>
                </Flex>
                {thisFilter.filter
                    ? createFilterElement({
                        filter: thisFilter.filter,
                        testSubjectType: 'NodeMetadata',
                        onChange(filter) {
                            onChange({
                                type: 'CHILD RECORD STORED',
                                cardinality: thisFilter.cardinality,
                                childKey: thisFilter.childKey,
                                filter: filter,
                                variable: thisFilter.variable
                            })
                        }
                    })
                    : <FilterSelectInput testSubjectType="NodeMetadata" onChoose={filter => {
                        onChange({
                            type: 'CHILD RECORD STORED',
                            cardinality: thisFilter.cardinality,
                            childKey: thisFilter.childKey,
                            filter: filter,
                            variable: thisFilter.variable
                        })
                    }} />
                }
                <Flex gap={8} alignItems="center">
                    <span>Store value as </span>
                    <input
                        type="text"
                        placeholder="variable name"
                        defaultValue={thisFilter.variable}
                        onChange={event => {
                            onChange({
                                type: 'CHILD RECORD STORED',
                                cardinality: thisFilter.cardinality,
                                childKey: thisFilter.childKey,
                                filter: structuredClone(thisFilter.filter),
                                variable: event.currentTarget.value
                            })
                        }}
                        style={{ maxWidth: 120 }}
                    />
                    <span>for subsequent filters.</span>
                </Flex>
            </Flex>
        </SearchFilter>
    )
}

export default StoredValueChildRecordFilter
