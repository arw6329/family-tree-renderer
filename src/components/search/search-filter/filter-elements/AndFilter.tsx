import Flex from "@/components/building-blocks/flex/Flex"
import SearchFilter from "../SearchFilter"
import { createFilterElement, executeFilter, type FilterDefinition, type FilterRegistration, type FilterTestSubjectType } from "../filters"
import FilterSelectInput from "../FilterSelectInput"
import HeaderButton from "@/components/building-blocks/header-button/HeaderButton"
import { IconContext } from "react-icons"
import { CgFilters } from "react-icons/cg"
import { LuReplace } from "react-icons/lu"

export type AndFilterDefinition = {
    type: 'AND' | 'OR'
    filters: FilterDefinition[]
}

export const andFilterRegistration: FilterRegistration<AndFilterDefinition> = {
    type: 'AND',
    createEmpty() {
        return {
            type: 'AND',
            filters: []
        }
    },
    execute(filter, testSubject, database): boolean {
        for(const subfilter of filter.filters) {
            if(!executeFilter(subfilter, testSubject, database)) {
                return false
            }
        }
        return true
    },
    element(props) {
        return <AndFilter {...props} />
    }
}

export const orFilterRegistration: FilterRegistration<AndFilterDefinition> = {
    type: 'OR',
    createEmpty() {
        return {
            type: 'OR',
            filters: []
        }
    },
    execute(filter, testSubject, database): boolean {
        for(const subfilter of filter.filters) {
            if(executeFilter(subfilter, testSubject, database)) {
                return true
            }
        }
        return false
    },
    element(props) {
        return <AndFilter {...props} />
    }
}

const AndFilter: React.FC<{
    filter: AndFilterDefinition
    testSubjectType: FilterTestSubjectType
    onChange: (filter: FilterDefinition | null) => void
}> = ({ filter: thisFilter, testSubjectType, onChange }) => {
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
                    {thisFilter.filters.map((filter, i) => createFilterElement({
                        filter,
                        testSubjectType,
                        onChange(filter) {
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
                        }
                    }))}
                    <FilterSelectInput testSubjectType={testSubjectType} onChoose={filter => {
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
