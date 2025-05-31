import ActionButton from "@/components/building-blocks/action-button/ActionButton"
import Flex from "@/components/building-blocks/flex/Flex"
import { NodeMetadata } from "@/lib/family-tree/FamilyTreeDatabase"
import { ReactNode, useState } from "react"
import EditableMetadataFrame from "../building-blocks/metadata-frame/editable/EditableMetadataFrame"
import SectionedDialog from "../building-blocks/sectioned-dialog/SectionedDialog"

type MetadataChangeCallback = (metadata: NodeMetadata[]) => void

const EditMetadataOverlay: React.FC<{
    metadata: NodeMetadata[],
    legalRootKeys: string[],
    onEditMetadata: MetadataChangeCallback,
    onFinished: () => void,
    title: ReactNode,
}> = ({ metadata, legalRootKeys, onEditMetadata, onFinished, title }) => {
    const [newMetadata, setNewMetadata] = useState(metadata)
    return (
        <SectionedDialog
            onClose={onFinished}
            minWidth={850}
            maxWidth={850}
            header={title}
            main={
                <EditableMetadataFrame
                    metadata={metadata}
                    legalRootKeys={legalRootKeys}
                    onMetadataChange={(metadata) => {
                        setNewMetadata(metadata)
                    }}
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
