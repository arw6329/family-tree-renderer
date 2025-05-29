import React, { ReactNode } from "react"
import "./HeaderButton.scoped.css"

const HeaderButton: React.FC<{
    imageButton?: boolean,
    tooltip?: string,
    onClick?: React.MouseEventHandler,
    children?: ReactNode
}> = (props) => {
    return (
        <div className="root">
            <button data-image-button={props.imageButton} onClick={props.onClick} aria-label={props.tooltip}>
                {props.children}
            </button>
            {props.tooltip && <span className="tooltip">{props.tooltip}</span>}
        </div>
    )
}

export default HeaderButton