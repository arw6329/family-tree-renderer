import { type ReactNode } from "react"
import ModalDialog from "../modal-dialog/ModalDialog"
import Flex from "../flex/Flex"

const SectionedDialog: React.FC<{
    onClose: () => void
    minWidth?: number
    maxWidth?: number
    header: ReactNode
    main: ReactNode
    footer: ReactNode
}> = ({
    onClose,
    minWidth = 600,
    maxWidth,
    header,
    main,
    footer
}) => {
    return (
        <ModalDialog onClose={onClose} minWidth={minWidth} maxWidth={maxWidth}>
            <Flex column={true} style={styles.root}>
                <div style={{ padding: 16 }}>
                    {header}
                </div>
                <div style={styles.center}>
                    {main}
                </div>
                <div style={{ padding: 16 }}>
                    {footer}
                </div>
            </Flex>
        </ModalDialog>
    )
}

const styles = {
    root: {
        border: '1px solid #495054',
        backgroundColor: '#1c1e1f',
        boxSizing: 'border-box' as const
    },
    
    center: {
        padding: '16px',
        backgroundColor: '#2b2f31',
        borderTop: '1px solid #495054',
        borderBottom: '1px solid #495054'
    }
}

export default SectionedDialog
