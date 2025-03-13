import ModalDialog from "../building-blocks/modal-dialog/ModalDialog"
import ActionButton from "@/components/building-blocks/action-button/ActionButton"
import Flex from "@/components/building-blocks/flex/Flex"
import { NodeMetadata } from "@/lib/family-tree/FamilyTreeDatabase"
import { ReactElement, ReactNode, useState } from "react"
import { SimpleMetadataSpec } from "@/lib/family-tree/metadata-helpers"
import EditableMetadataFrame from "../building-blocks/metadata-frame/EditableMetadataFrame"

type MetadataChangeCallback = (metadata: NodeMetadata[]) => void

const EditMetadataOverlay: React.FC<{
    metadata: NodeMetadata[],
    onEditMetadata: MetadataChangeCallback,
    onFinished: () => void,
    title: ReactNode,
    simpleSchema: SimpleMetadataSpec,
    simpleRepresentation: (metadata: NodeMetadata[], onMetadataChange: MetadataChangeCallback) => ReactElement<{ onMetadataChange: MetadataChangeCallback }>,
    minWidth?: number
}> = ({ metadata, onEditMetadata, onFinished, title, simpleSchema, simpleRepresentation, minWidth }) => {
    const [newMetadata, setNewMetadata] = useState(metadata)
    return (
        <ModalDialog onClose={onFinished} minWidth={minWidth}>
            <div style={styles.root}>
                {title}
                <EditableMetadataFrame
                    metadata={metadata}
                    simpleSchema={simpleSchema}
                    onMetadataChange={(metadata) => {
                        setNewMetadata(metadata)
                    }}
                    simpleRepresentation={simpleRepresentation}
                />
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
        </ModalDialog>
    )
}

const styles = {
    root: {
        display: 'flex',
        flexDirection: 'column' as const,
        border: '1px solid #495054',
        backgroundColor: '#1c1e1f',
        padding: 16,
        gap: 16,
        boxSizing: 'border-box' as const
    }
}

export default EditMetadataOverlay
