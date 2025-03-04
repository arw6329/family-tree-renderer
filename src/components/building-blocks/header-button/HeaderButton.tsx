import React, { ReactNode } from "react"
import "./HeaderButton.scoped.css"

const HeaderButton: React.FC<{ onClick?: React.MouseEventHandler, children?: ReactNode }> = (props) => {
    return (
        <button onClick={props.onClick}>
            {props.children}
        </button>
    )
}

export default HeaderButton