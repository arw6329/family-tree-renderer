import React, { ReactNode } from "react"
import "./ActionButton.scoped.css"

const ActionButton: React.FC<{
    onClick?: React.MouseEventHandler,
    disabled?: boolean,
    children?: ReactNode
}> = (props) => {
    return (
        <button onClick={props.onClick} disabled={props.disabled || undefined}>
            {props.children}
        </button>
    )
}

export default ActionButton