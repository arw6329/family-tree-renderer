import ActionButton from "@/components/building-blocks/action-button/ActionButton"
import Flex from "@/components/building-blocks/flex/Flex"
import { NodeMetadata } from "@/lib/family-tree/FamilyTreeDatabase"
import { ReactElement, ReactNode, useState } from "react"
import { SimpleMetadataSpec } from "@/lib/family-tree/metadata-helpers"
import EditableMetadataFrame from "../building-blocks/metadata-frame/editable/EditableMetadataFrame"
import SectionedDialog from "../building-blocks/sectioned-dialog/SectionedDialog"

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
        <SectionedDialog
            onClose={onFinished}
            minWidth={minWidth}
            header={title}
            main={
                <EditableMetadataFrame
                    metadata={metadata}
                    legalRootKeys={legalRootKeys}
                    simpleSchema={simpleSchema}
                    onMetadataChange={(metadata) => {
                        setNewMetadata(metadata)
                    }}
                    simpleRepresentation={simpleRepresentation}
                />
            }
            footer={
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
            }
        />
    )
}

export default EditMetadataOverlay
