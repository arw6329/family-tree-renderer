import { IconContext } from "react-icons"
import { FaPlus } from "react-icons/fa6"
import "./AddNodeButton.scoped.css"

const NODE_FOREIGNOBJECT_WIDTH = 50
const NODE_FOREIGNOBJECT_HEIGHT = 50

const AddNodeButton: React.FC<{ x: number, y: number, onClick?: () => void }> = ({ x, y, onClick }) => {
    return (
        <foreignObject
            x={x - NODE_FOREIGNOBJECT_WIDTH / 2}
            y={y - NODE_FOREIGNOBJECT_HEIGHT / 2}
            width={NODE_FOREIGNOBJECT_WIDTH}
            height={NODE_FOREIGNOBJECT_HEIGHT}
        >
            <button onClick={() => onClick?.()}>
                <IconContext.Provider value={{ style: { width: 25, height: 25 } }}>
                    <FaPlus fill="white" />
                </IconContext.Provider>
            </button>
        </foreignObject>
    )
}

export default AddNodeButton
