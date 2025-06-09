import Flex from "@/components/building-blocks/flex/Flex"
import SearchFilter from "../SearchFilter"
import type { FilterDefinition } from "../FilterDefinition"
import { selectFilter } from "../FilterSelection"
import HeaderButton from "@/components/building-blocks/header-button/HeaderButton"
import { IconContext } from "react-icons"
import { LuReplace } from "react-icons/lu"
import FilterSelectInput from "../FilterSelectInput"

export type ChildRecordFilterDefinition = {
    type: 'CHILD RECORD'
    cardinality: 'any' | 'first'
    childKey: string
    filter: FilterDefinition | null
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
            extraControlButtons={
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
                    ? selectFilter(thisFilter.filter, 'NodeMetadata', filter => {
                        onChange({
                            type: 'CHILD RECORD',
                            cardinality: thisFilter.cardinality,
                            childKey: thisFilter.childKey,
                            filter: filter
                        })
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

export default ChildRecordFilter
