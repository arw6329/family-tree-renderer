import React, { MouseEventHandler } from "react"
import { FaCircleInfo } from "react-icons/fa6"
import "./RelationshipInfoButton.scoped.css"
import { IconContext } from "react-icons"

const NODE_FOREIGNOBJECT_WIDTH = 25
const NODE_FOREIGNOBJECT_HEIGHT = 25

const RelationshipInfoButton: React.FC<{ x: number, y: number, ariaLabel: string, onClick: MouseEventHandler }> = ({x, y, ariaLabel, onClick}) => {
    return (
        <foreignObject
            x={x - NODE_FOREIGNOBJECT_WIDTH / 2}
            y={y - NODE_FOREIGNOBJECT_HEIGHT / 2}
            width={NODE_FOREIGNOBJECT_WIDTH}
            height={NODE_FOREIGNOBJECT_HEIGHT}
        >
            <button onClick={onClick} aria-label={ariaLabel}>
                <IconContext.Provider value={{ style: { width: '100%', height: '100%' } }}>
                    <FaCircleInfo fill="#dfdfdf" />
                </IconContext.Provider>
            </button>
        </foreignObject>
    )
}

export default RelationshipInfoButton