import { ReactNode, useEffect, useRef } from "react"
import "./ModalDialog.scoped.css"

const ModalDialog: React.FC<{ children: ReactNode }> = ({ children }) => {
    const dialog = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        dialog.current!.showModal()
    }, [dialog.current])

    return (
        <dialog ref={dialog}>
            <div className="root">
                {children}
            </div>
        </dialog>
    )
}

export default ModalDialog
