import ModalDialog from "../building-blocks/modal-dialog/ModalDialog"
import ActionButton from "@/components/building-blocks/action-button/ActionButton"
import Flex from "@/components/building-blocks/flex/Flex"
import { NodeMetadata } from "@/lib/family-tree/FamilyTreeDatabase"
import { ReactElement, ReactNode, useState } from "react"
import { SimpleMetadataSpec } from "@/lib/family-tree/metadata-helpers"
import EditableMetadataFrame from "../building-blocks/metadata-frame/editable/EditableMetadataFrame"

type MetadataChangeCallback = (metadata: NodeMetadata[]) => void

const EditMetadataOverlay: React.FC<{
    metadata: NodeMetadata[],
    legalRootKeys: string[],
    onEditMetadata: MetadataChangeCallback,
    onFinished: () => void,
    title: ReactNode,
    simpleSchema: SimpleMetadataSpec,
    simpleRepresentation: (metadata: NodeMetadata[], onMetadataChange: MetadataChangeCallback) => ReactElement<{ onMetadataChange: MetadataChangeCallback }>,
    minWidth?: number
}> = ({ metadata, legalRootKeys, onEditMetadata, onFinished, title, simpleSchema, simpleRepresentation, minWidth }) => {
    const [newMetadata, setNewMetadata] = useState(metadata)
    return (
        <ModalDialog onClose={onFinished} minWidth={minWidth}>
            <Flex column={true} style={styles.root}>
                <div style={{ padding: 16 }}>{title}</div>
                <div style={styles.center}>
                    <EditableMetadataFrame
                        metadata={metadata}
                        legalRootKeys={legalRootKeys}
                        simpleSchema={simpleSchema}
                        onMetadataChange={(metadata) => {
                            setNewMetadata(metadata)
                        }}
                        simpleRepresentation={simpleRepresentation}
                    />
                </div>
                <div style={{ padding: 16 }}>
                    <Flex gap={6}>
                        <ActionButton onClick={() => {
                            onEditMetadata(newMetadata)
                            onFinished()
                        }}>
                            <span>Save</span>
                        </ActionButton>
                        <ActionButton onClick={() => onFinished()}>
                            <span>Cancel</span>
                        </ActionButton>
                    </Flex>
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

export default EditMetadataOverlay
