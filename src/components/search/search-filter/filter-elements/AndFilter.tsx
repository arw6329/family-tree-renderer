import Flex from "@/components/building-blocks/flex/Flex"
import SearchFilter from "../SearchFilter"
import { FilterDefinition } from "../FilterDefinition"
import { selectFilter } from "../FilterSelection"
import FilterSelectInput from "../FilterSelectInput"
import HeaderButton from "@/components/building-blocks/header-button/HeaderButton"
import { IconContext } from "react-icons"
import { CgFilters } from "react-icons/cg"
import { LuReplace } from "react-icons/lu"

export type AndFilterDefinition = {
    type: 'AND' | 'OR'
    filters: FilterDefinition[]
}

const AndFilter: React.FC<{
    filter: AndFilterDefinition
    onChange: (filter: FilterDefinition | null) => void
}> = ({ filter: thisFilter, onChange }) => {
    return (
        <SearchFilter
            operation={thisFilter.type}
            color={thisFilter.type === 'AND' ? 'orange' : '#9cdd66'}
            filter={thisFilter}
            onChange={onChange}
            extraControlButtons={
                <>
                    <HeaderButton
                        imageButton={true}
                        tooltip={`Switch to ${thisFilter.type === 'AND' ? 'OR' : 'AND'}`}
                        tooltipSide="left"
                        onClick={() => {
                            onChange({
                                type: thisFilter.type === 'AND' ? 'OR' : 'AND',
                                filters: structuredClone(thisFilter.filters)
                            })
                        }}
                    >
                        <IconContext.Provider value={{ style: { height: 20, width: 20, transform: 'scaleY(-1)' } }}>
                            <CgFilters />
                        </IconContext.Provider>
                    </HeaderButton>
                    {thisFilter.filters.length === 1 && <HeaderButton
                        imageButton={true}
                        tooltip="Replace with child"
                        tooltipSide="left"
                        onClick={() => {
                            onChange(structuredClone(thisFilter.filters[0]))
                        }}
                    >
                        <IconContext.Provider value={{ style: { height: 20, width: 20, transform: 'scaleY(-1)' } }}>
                            <LuReplace />
                        </IconContext.Provider>
                    </HeaderButton>}
                </>
            }
        >
            <Flex column={true} gap={15}>
                <span>{thisFilter.type === 'AND' ? 'All' : 'Any of'} these filters match:</span>
                <Flex column={true} gap={10} alignItems="baseline">
                    {thisFilter.filters.map((filter, i) => selectFilter(filter, filter => {
                        const newFilters = structuredClone(thisFilter.filters)
                        if(filter) {
                            newFilters[i] = filter
                        } else {
                            newFilters.splice(i, 1)
                        }
                        onChange({
                            type: thisFilter.type,
                            filters: newFilters
                        })
                    }))}
                    <FilterSelectInput onChoose={filter => {
                        const newFilters = structuredClone(thisFilter.filters)
                        newFilters.push(filter)
                        onChange({
                            type: thisFilter.type,
                            filters: newFilters
                        })
                    }} />
                </Flex>
            </Flex>
        </SearchFilter>
    )
}

export default AndFilter
