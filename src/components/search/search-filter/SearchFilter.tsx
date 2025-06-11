import Flex from "@/components/building-blocks/flex/Flex"
import "./FiltersAndExpressions.scoped.css"
import type { ReactNode } from "react"
import type React from "react"
import HeaderButton from "@/components/building-blocks/header-button/HeaderButton"
import { IconContext } from "react-icons"
import { RiCloseCircleFill } from "react-icons/ri"
import { FaNotEqual } from "react-icons/fa6"
import { TbFilterPlus } from "react-icons/tb"
import type { FilterDefinition } from "./filters"

const SearchFilter: React.FC<{
    operation: string
    color: string
    children: ReactNode
    extraControlButtons?: ReactNode
    filter: FilterDefinition
    onChange: (newFilter: FilterDefinition | null) => void
    allowWraps?: boolean
}> = ({ operation, color, children, extraControlButtons, filter, onChange, allowWraps = true }) => {
    return (
        <div className="root" style={{ '--color': color } as React.CSSProperties}>
            <Flex column={true}>
                <div className="header">
                    <span className="label">{operation}</span>
                    <div style={{ flexGrow: 1 }} />
                    <div className="control-buttons">
                        {allowWraps && <>
                            <HeaderButton
                                imageButton={true}
                                tooltip="Wrap with AND/OR"
                                tooltipSide="left"
                                onClick={() => {
                                    onChange({
                                        type: 'AND',
                                        filters: [structuredClone(filter)]
                                    })
                                }}
                            >
                                <IconContext.Provider value={{ style: { height: 20, width: 15 } }}>
                                    <TbFilterPlus />
                                </IconContext.Provider>
                            </HeaderButton>
                            <HeaderButton
                                imageButton={true}
                                tooltip="Wrap with NOT"
                                tooltipSide="left"
                                onClick={() => {
                                    onChange({
                                        type: 'NOT',
                                        filter: structuredClone(filter)
                                    })
                                }}
                            >
                                <IconContext.Provider value={{ style: { height: 20, width: 15 } }}>
                                    <FaNotEqual />
                                </IconContext.Provider>
                            </HeaderButton>
                        </>}
                        {extraControlButtons}
                        <HeaderButton
                            imageButton={true}
                            tooltip="Delete filter"
                            tooltipSide="left"
                            onClick={() => {
                                onChange(null)
                            }}
                        >
                            <IconContext.Provider value={{ style: { height: 20, width: 20 } }}>
                                <RiCloseCircleFill />
                            </IconContext.Provider>
                        </HeaderButton>
                    </div>
                </div>
                <div className="main">
                    {children}
                </div>
            </Flex>
        </div>
    )
}

export default SearchFilter
