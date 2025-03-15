import ActionButton from "@/components/building-blocks/action-button/ActionButton"
import Flex from "@/components/building-blocks/flex/Flex"
import MetadataFrame from "../building-blocks/metadata-frame/MetadataFrame"
import { NodeMetadata } from "@/lib/family-tree/FamilyTreeDatabase"
import { ReactNode } from "react"
import SectionedDialog from "../building-blocks/sectioned-dialog/SectionedDialog"

const ViewMetadataOverlay: React.FC<{
    metadata: NodeMetadata[]
    onFinished: () => void
    title: ReactNode
}> = ({ metadata, onFinished, title }) => {
    return (
        <SectionedDialog
            onClose={onFinished}
            header={title}
            main={
                <MetadataFrame metadata={metadata} />
            }
            footer={
                <Flex gap={6}>
                    <ActionButton onClick={() => onFinished()}>
                        <span>Close</span>
                    </ActionButton>
                </Flex>
            }
        />
    )
}


export default ViewMetadataOverlay
