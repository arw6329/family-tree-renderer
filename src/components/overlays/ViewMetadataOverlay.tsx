import ModalDialog from "../building-blocks/modal-dialog/ModalDialog"
import ActionButton from "@/components/building-blocks/action-button/ActionButton"
import Flex from "@/components/building-blocks/flex/Flex"
import MetadataFrame from "../building-blocks/metadata-frame/MetadataFrame"
import { NodeMetadata } from "@/lib/family-tree/FamilyTreeDatabase"
import { ReactNode } from "react"
import { SimpleMetadataSpec } from "@/lib/family-tree/metadata-helpers"

const ViewMetadataOverlay: React.FC<{
    metadata: NodeMetadata[],
    onFinished: () => void,
    title: ReactNode,
    simpleSchema: SimpleMetadataSpec,
    simpleRepresentation: (metadata: NodeMetadata[]) => ReactNode
}> = ({ metadata, onFinished, title, simpleSchema, simpleRepresentation }) => {
    return (
        <ModalDialog onClose={onFinished}>
            <div style={styles.root}>
                {title}
                <MetadataFrame metadata={metadata} simpleSchema={simpleSchema} simpleRepresentation={simpleRepresentation} />
                <Flex gap={6}>
                    <ActionButton onClick={() => onFinished()}>
                        <span>Close</span>
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

export default ViewMetadataOverlay
