import React from "react"
import "./SvgLine.css"

const SvgLine: React.FC<{ x1: number, y1: number, x2: number, y2: number, incomplete?: boolean }> = (props) => {
    return (
        <line className={props.incomplete ? 'incomplete' : ''} {...props} />
    )
}

export default SvgLine