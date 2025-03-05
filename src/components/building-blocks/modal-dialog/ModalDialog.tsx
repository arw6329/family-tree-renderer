import { ReactNode, useEffect, useRef } from "react"
import "./ModalDialog.scoped.css"

const ModalDialog: React.FC<{ onClose: () => void, minWidth?: number, children: ReactNode }> = ({ onClose, minWidth = 600, children }) => {
    const dialog = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        dialog.current!.showModal()
        ;['wheel', 'touchend', 'touchmove', 'touchstart', 'pointermove', 'pointerout', 'pointerup', 'pointerdown']
            .forEach(eventType => dialog.current.addEventListener(eventType, evt => evt.stopPropagation()))
    }, [dialog.current])

    return (
        <dialog
            ref={dialog}
            onKeyDown={(event) => {
                if(event.key === 'Escape') {
                    onClose()
                }
            }}
            style={{
                minWidth: `min(${minWidth}px, 95vw)`
            }}
        >
            <div className="root">
                {children}
            </div>
        </dialog>
    )
}

export default ModalDialog
