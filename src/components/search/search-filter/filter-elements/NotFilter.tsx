import Flex from "@/components/building-blocks/flex/Flex"
import SearchFilter from "../SearchFilter"
import { createFilterElement, executeFilter, type FilterDefinition, type FilterRegistration, type FilterTestSubjectType } from "../filters"
import HeaderButton from "@/components/building-blocks/header-button/HeaderButton"
import { IconContext } from "react-icons"
import { LuReplace } from "react-icons/lu"
import FilterSelectInput from "../FilterSelectInput"

export type NotFilterDefinition = {
    type: 'NOT'
    filter: FilterDefinition | null
}

export const notFilterRegistration: FilterRegistration<NotFilterDefinition> = {
    type: 'NOT',
    createEmpty() {
        return {
            type: 'NOT',
            filter: {
                type: 'NO-OP'
            }
        }
    },
    execute(filter, testSubject, database): boolean {
        return !executeFilter(filter.filter, testSubject, database)
    },
    element(props) {
        return <NotFilter {...props} />
    }
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
                    ? createFilterElement({
                        filter: thisFilter.filter,
                        testSubjectType,
                        onChange(filter) {
                            onChange({
                                type: 'NOT',
                                filter: filter
                            })
                        }
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
