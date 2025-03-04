import { IconContext } from "react-icons"
import "./DismissableBlock.scoped.css"
import { FaXmark } from "react-icons/fa6"
import type { ReactNode } from "react"

const DismissableBlock: React.FC<{ onDismiss: () => void, closeButtonTitle: string, children: ReactNode }> = ({ onDismiss, closeButtonTitle, children }) => {
    return (
        <div className="root">
            <button className="close-button" title={closeButtonTitle} onClick={() => onDismiss()}>
                <IconContext.Provider value={{ style: { height: 20, width: 20 } }}>
                    <FaXmark fill="rgb(143, 151, 155)" />
                </IconContext.Provider>
            </button>
            {children}
        </div>
    )
}

export default DismissableBlock
