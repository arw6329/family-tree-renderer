import React from "react"
import "./ChildRelationshipLabel.scoped.css"

const NODE_FOREIGNOBJECT_WIDTH = 100
const NODE_FOREIGNOBJECT_HEIGHT = 30

const ChildRelationshipLabel: React.FC<{ x: number, y: number, width?: number, labelText: string }> = ({ x, y, width = NODE_FOREIGNOBJECT_WIDTH, labelText }) => {
    return (
        <foreignObject
            x={x - width / 2}
            y={y - NODE_FOREIGNOBJECT_HEIGHT / 2}
            width={width}
            height={NODE_FOREIGNOBJECT_HEIGHT}
        >
            <div className="root">
                <span>{labelText}</span>
            </div>
        </foreignObject>
    )
}

export default ChildRelationshipLabel
