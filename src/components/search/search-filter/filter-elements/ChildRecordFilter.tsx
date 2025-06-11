import Flex from "@/components/building-blocks/flex/Flex"
import SearchFilter from "../SearchFilter"
import { createFilterElement, executeFilter, type FilterDefinition, type FilterRegistration } from "../filters"
import HeaderButton from "@/components/building-blocks/header-button/HeaderButton"
import { IconContext } from "react-icons"
import { LuReplace } from "react-icons/lu"
import FilterSelectInput from "../FilterSelectInput"
import { derefRecord } from "@/lib/family-tree/metadata-helpers"
import type { NodeMetadata } from "@/lib/family-tree/FamilyTreeDatabase"

export type ChildRecordFilterDefinition = {
    type: 'CHILD RECORD'
    cardinality: 'any' | 'first'
    childKey: string
    filter: FilterDefinition | null
}

export const childRecordFilterRegistration: FilterRegistration<ChildRecordFilterDefinition> = {
    type: 'CHILD RECORD',
    createEmpty() {
        return {
            type: 'CHILD RECORD',
            cardinality: 'any',
            childKey: '',
            filter: {
                type: 'NO-OP'
            }
        }
    },
    execute(filter, testSubject, database): boolean {
        // We do not have to deref testSubject or its children here if
        // testSubject is of type NodeMetadata because the only way
        // for NodeMetadata to be fed to executeFilter is from feeding a
        // Profile/SpousalRelationship/ChildRelationship as the testSubject to
        // executeFilter and having a CHILD RECORD filter run on its children, in
        // which case the children would be dereffed there. This might have to be
        // changed if searching root metadata directly is ever implemented. 
        const children = ('metadata' in testSubject
            ? testSubject.metadata.map(child => derefRecord(child, metadataId => database.getRootMetadataById(metadataId)))
            : testSubject.children) as (NodeMetadata & { type: 'simple' })[]
        
        for(const child of children) {
            if(child.key !== filter.childKey) {
                continue
            }

            if(executeFilter(filter.filter, child, database)) {
                return true
            } else if(filter.cardinality === 'first') {
                return false
            }
        }
        return false
    },
    element(props) {
        return <ChildRecordFilter {...props} />
    }
}

const ChildRecordFilter: React.FC<{
    filter: ChildRecordFilterDefinition
    onChange: (filter: FilterDefinition | null) => void
}> = ({ filter: thisFilter, onChange }) => {
    return (
        <SearchFilter
            operation="CHILD RECORD"
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
                            type: 'CHILD RECORD',
                            cardinality: event.currentTarget.value as ChildRecordFilterDefinition['cardinality'],
                            childKey: thisFilter.childKey,
                            filter: structuredClone(thisFilter.filter)
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
                                type: 'CHILD RECORD',
                                cardinality: thisFilter.cardinality,
                                childKey: event.currentTarget.value,
                                filter: structuredClone(thisFilter.filter)
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
                                type: 'CHILD RECORD',
                                cardinality: thisFilter.cardinality,
                                childKey: thisFilter.childKey,
                                filter: filter
                            })
                        }
                    })
                    : <FilterSelectInput testSubjectType="NodeMetadata" onChoose={filter => {
                        onChange({
                            type: 'CHILD RECORD',
                            cardinality: thisFilter.cardinality,
                            childKey: thisFilter.childKey,
                            filter: filter
                        })
                    }} />
                }
            </Flex>
        </SearchFilter>
    )
}
