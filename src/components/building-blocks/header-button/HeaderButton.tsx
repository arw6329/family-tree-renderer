import React, { ReactNode } from "react"
import "./HeaderButton.scoped.css"

const HeaderButton: React.FC<{
    imageButton?: boolean
    tooltip?: string
    tooltipSide?: 'left' | 'right'
    onClick?: React.MouseEventHandler
    children?: ReactNode
}> = (props) => {
    return (
        <div className="root">
            <button data-image-button={props.imageButton} onClick={props.onClick} aria-label={props.tooltip}>
                {props.children}
            </button>
            {props.tooltip && <span className="tooltip" data-side={props.tooltipSide ?? 'right'}>{props.tooltip}</span>}
        </div>
    )
}

export default HeaderButton