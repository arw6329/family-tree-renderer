import Flex from "@/components/building-blocks/flex/Flex"
import "../FiltersAndExpressions.scoped.css"
import type { ReactNode } from "react"
import type React from "react"
import HeaderButton from "@/components/building-blocks/header-button/HeaderButton"
import { IconContext } from "react-icons"
import { RiCloseCircleFill } from "react-icons/ri"
import type { ValueExpressionDefinition } from "./expressions"

const ValueExpression: React.FC<{
    label: string
    color: string
    children: ReactNode
    extraControlButtons?: ReactNode
    expression: ValueExpressionDefinition
    onChange: (newExpression: ValueExpressionDefinition | null) => void
    allowWraps?: boolean
}> = ({ label, color, children, extraControlButtons, expression, onChange, allowWraps = true }) => {
    return (
        <div className="root" style={{ '--color': color } as React.CSSProperties}>
            <Flex column={true}>
                <div className="header">
                    <span className="label">{label}</span>
                    <div style={{ flexGrow: 1 }} />
                    <div className="control-buttons">
                        {allowWraps && <>

                        </>}
                        {extraControlButtons}
                        <HeaderButton
                            imageButton={true}
                            tooltip="Delete expression"
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

export default ValueExpression
