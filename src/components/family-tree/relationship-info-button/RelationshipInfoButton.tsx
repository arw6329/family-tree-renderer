import React, { MouseEventHandler } from "react"
import "./RelationshipInfoButton.css"

const NODE_FOREIGNOBJECT_WIDTH = 25
const NODE_FOREIGNOBJECT_HEIGHT = 25

const RelationshipInfoButton: React.FC<{ x: number, y: number, onClick: MouseEventHandler }> = ({x, y, onClick}) => {
    return (
        <foreignObject
            x={x - NODE_FOREIGNOBJECT_WIDTH / 2}
            y={y - NODE_FOREIGNOBJECT_HEIGHT / 2}
            width={NODE_FOREIGNOBJECT_WIDTH}
            height={NODE_FOREIGNOBJECT_HEIGHT}
        >
            <button onClick={onClick}>
                i
            </button>
        </foreignObject>
    )
}

export default RelationshipInfoButton