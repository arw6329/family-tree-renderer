import React, { ReactNode } from "react"
import Flex from "../flex/Flex"

const LabeledElement: React.FC<{
    label: string
    text?: string
    style?: React.CSSProperties
    children?: ReactNode
}> = ({ label, text, style, children }) => {
    return (
        <Flex column={true} gap={5} style={style}>
            <label>{label}</label>
            {children ?? <span style={{ color: '#ccc', fontWeight: 'bold' }}>{text}</span>}
        </Flex>
    )
}

export default LabeledElement