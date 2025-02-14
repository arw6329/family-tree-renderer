import { ReactNode, useEffect, useRef } from "react"
import "./ModalDialog.scoped.css"

const ModalDialog: React.FC<{ onClose: () => void, children: ReactNode }> = ({ onClose, children }) => {
    const dialog = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        dialog.current!.showModal()
        ;['wheel', 'touchend', 'touchmove', 'touchstart', 'pointermove', 'pointerout', 'pointerup', 'pointerdown']
            .forEach(eventType => dialog.current.addEventListener(eventType, evt => evt.stopPropagation()))
    }, [dialog.current])

    return (
        <dialog ref={dialog} onKeyDown={(event) => { if(event.key === 'Escape') onClose() }}>
            <div className="root">
                {children}
            </div>
        </dialog>
    )
}

export default ModalDialog
