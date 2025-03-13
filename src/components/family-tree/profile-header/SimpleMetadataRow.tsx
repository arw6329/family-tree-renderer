import Grid from "@/components/building-blocks/grid/Grid"
import LabeledElement from "@/components/building-blocks/labeled-text/LabeledText"
import { prettyDate } from "@/lib/family-tree/date-utils"
import { NodeMetadata } from "@/lib/family-tree/FamilyTreeDatabase"
import { getEventDate } from "@/lib/family-tree/metadata-helpers"

const SimpleMetadataRow: React.FC<{ metadata: NodeMetadata[] }> = ({ metadata }) => {
    const dateOfBirth = getEventDate('BIRTH', metadata)
    const dateOfDeath = getEventDate('DEATH', metadata)
    return <Grid gap={20} columns="repeat(auto-fill, 150px)" justifyContent="space-evenly" style={{ flexGrow: 1 }}>
        {dateOfBirth && <LabeledElement label="Date of birth" text={prettyDate(dateOfBirth)} />}
        {dateOfDeath && <LabeledElement label="Date of death" text={prettyDate(dateOfDeath)} />}
    </Grid>
}

export default SimpleMetadataRow
