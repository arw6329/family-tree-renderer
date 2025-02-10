import React from "react"

const NODE_FOREIGNOBJECT_WIDTH = 150
const NODE_FOREIGNOBJECT_HEIGHT = 50

const MultiSpouseBlock: React.FC<{ x: number, y: number, spouseCount: number }> = ({x, y, spouseCount}) => {
    return (
        <foreignObject
            x={x - NODE_FOREIGNOBJECT_WIDTH / 2}
            y={y - NODE_FOREIGNOBJECT_HEIGHT / 2}
            width={NODE_FOREIGNOBJECT_WIDTH}
            height={NODE_FOREIGNOBJECT_HEIGHT}
        >
            <span>{spouseCount} other spouses</span>
        </foreignObject>
    )
}

export default MultiSpouseBlock
