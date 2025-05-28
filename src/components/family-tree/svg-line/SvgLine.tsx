import React from "react"
import "./SvgLine.css"

const SvgLine: React.FC<{ x1: number, y1: number, x2: number, y2: number, xyflip: boolean, incomplete?: boolean }> = (props) => {
    const coords = {
        x1: props.xyflip ? props.y1 : props.x1,
        y1: props.xyflip ? props.x1 : props.y1,
        x2: props.xyflip ? props.y2 : props.x2,
        y2: props.xyflip ? props.x2 : props.y2
    }

    return (
        <line className={props.incomplete ? 'incomplete' : ''} {...coords} />
    )
}

export default SvgLine