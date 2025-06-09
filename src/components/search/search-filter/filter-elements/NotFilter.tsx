import Flex from "@/components/building-blocks/flex/Flex"
import SearchFilter from "../SearchFilter"
import type { FilterDefinition, FilterTestSubjectType } from "../FilterDefinition"
import { selectFilter } from "../FilterSelection"
import HeaderButton from "@/components/building-blocks/header-button/HeaderButton"
import { IconContext } from "react-icons"
import { LuReplace } from "react-icons/lu"
import FilterSelectInput from "../FilterSelectInput"

export type NotFilterDefinition = {
    type: 'NOT'
    filter: FilterDefinition | null
}

const NotFilter: React.FC<{
    filter: NotFilterDefinition
    testSubjectType: FilterTestSubjectType
    onChange: (filter: FilterDefinition | null) => void
}> = ({ filter: thisFilter, testSubjectType, onChange }) => {
    return (
        <SearchFilter
            operation="NOT"
            color="#ee6d6d"
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
            <Flex>
                {thisFilter.filter
                    ? selectFilter(thisFilter.filter, testSubjectType, filter => {
                        onChange({
                            type: 'NOT',
                            filter: filter
                        })
                    })
                    : <FilterSelectInput testSubjectType={testSubjectType} onChoose={filter => {
                        onChange({
                            type: 'NOT',
                            filter: filter
                        })
                    }} />
                }
            </Flex>
        </SearchFilter>
    )
}

export default NotFilter
