import React from "react"
import "./ChildRelationshipLabel.scoped.css"

const NODE_FOREIGNOBJECT_WIDTH = 100
const NODE_FOREIGNOBJECT_HEIGHT = 30

const ChildRelationshipLabel: React.FC<{ x: number, y: number, labelText: string }> = ({ x, y, labelText }) => {
    return (
        <foreignObject
            x={x - NODE_FOREIGNOBJECT_WIDTH / 2}
            y={y - NODE_FOREIGNOBJECT_HEIGHT / 2}
            width={NODE_FOREIGNOBJECT_WIDTH}
            height={NODE_FOREIGNOBJECT_HEIGHT}
        >
            <div className="root">
                <span>{labelText}</span>
            </div>
        </foreignObject>
    )
}

export default ChildRelationshipLabel
