import HeaderButton from "@/components/building-blocks/header-button/HeaderButton"
import "./RelationshipHeader.scoped.css"
import { useContext, useState } from "react"
import { FamilyTreeStateContext } from "../FamilyTreeState"
import AddChildOverlay from "@/components/overlays/AddChildOverlay"
import DismissableBlock from "@/components/building-blocks/dismissable-block/DismissableBlock"
import ViewMetadataOverlay from "@/components/overlays/ViewMetadataOverlay"
import LabeledElement from "@/components/building-blocks/labeled-text/LabeledText"
import Grid from "@/components/building-blocks/grid/Grid"
import { getEventDate, getFirstRecord, getSpousalRelationshipType, isMetadataSimple } from "@/lib/family-tree/metadata-helpers"
import { prettyDate } from "@/lib/family-tree/date-utils"
import { NodeMetadata, SpousalRelationship } from "@/lib/family-tree/FamilyTreeDatabase"
import EditMetadataOverlay from "@/components/overlays/EditMetadataOverlay"

const SimpleMetadataRow: React.FC<{ metadata: NodeMetadata[] }> = ({ metadata }) => {
    const type = getSpousalRelationshipType(metadata)
    const marriageDate = getEventDate('MARRIAGE', metadata)
    const marriageRecord = getFirstRecord('MARRIAGE', metadata)
    const divorceDate = marriageRecord ? getEventDate('DIVORCE', marriageRecord.children) : null
    return <Grid gap={15} columns="repeat(auto-fill, 150px)" justifyContent="space-evenly" style={{ flexGrow: 1 }}>
        {type && <LabeledElement label="Relationship type" text={{
            'married': 'Married',
            'divorced': 'Divorced',
            'never-married': 'Never married'
        }[type]} />}
        {marriageDate && <LabeledElement label="Marriage date" text={prettyDate(marriageDate)} />}
        {divorceDate  && <LabeledElement label="Divorce date"  text={prettyDate(divorceDate)} />}
    </Grid>
}

const SpousalRelationshipHeader: React.FC<{  }> = ({  }) => {
    const state = useContext(FamilyTreeStateContext)
    const [addChildOverlayActive, setAddChildOverlayActive] = useState(false)
    const [moreDetailsPopupActive, setMoreDetailsPopupActive] = useState(false)

    const relationship = state.getObjectById('SpousalRelationship', state.focusedSpousalRelationshipId!)!
    const spouse1 = state.getObjectById('Profile', relationship.spouse_1_profile_id)!
    const spouse2 = state.getObjectById('Profile', relationship.spouse_2_profile_id)!

    return (
        <header>
            <DismissableBlock closeButtonTitle="Close relationship details" onDismiss={() => state.setFocusedObjectId('SpousalRelationship', null)}>
                <div className="row" style={{ minHeight: 80 }}>
                    <span className="name">Relationship between<br />{spouse1.name} and {spouse2.name}</span>
                    <SimpleMetadataRow metadata={relationship.metadata} />
                </div>
            </DismissableBlock>
            <div className="row">
                {(state.editing || !isMetadataSimple(relationship.metadata, {
                    MARRIAGE: {
                        DATE: {},
                        DIVORCE: {
                            DATE: {}
                        }
                    }
                })) && <>
                    <HeaderButton onClick={() => setMoreDetailsPopupActive(true)}>
                        <span>{state.editing ? 'Edit' : 'View'} details</span>
                    </HeaderButton>
                </>}
                {state.editing && <>
                    <HeaderButton onClick={() => {
                        state.disconnectSpouses(relationship)
                        state.setFocusedObjectId('SpousalRelationship', null)
                    }}>
                        <span>Break relationship</span>
                    </HeaderButton>
                    <HeaderButton onClick={() => setAddChildOverlayActive(true)}>
                        <span>Add child</span>
                    </HeaderButton>
                </>}
            </div>

            {addChildOverlayActive && <>
                <AddChildOverlay
                    parentRelationship={relationship}
                    onFinished={() => setAddChildOverlayActive(false)}
                />
            </>}

            {moreDetailsPopupActive && !state.editing && <>
                <ViewMetadataOverlay
                    metadata={relationship.metadata}
                    onFinished={() => setMoreDetailsPopupActive(false)}
                    title={<span>Relationship between {spouse1.name} and {spouse2.name}</span>}
                />                    
            </>}

            {moreDetailsPopupActive && state.editing && <>
                <EditMetadataOverlay
                    minWidth={780}
                    metadata={relationship.metadata}
                    legalRootKeys={[
                        'MARRIAGE',
                        'NOTE'
                    ]}
                    onEditMetadata={(metadata) => {
                        const newRelationship: SpousalRelationship = {
                            relationship_id: relationship.relationship_id,
                            spouse_1_profile_id: relationship.spouse_1_profile_id,
                            spouse_2_profile_id: relationship.spouse_2_profile_id,
                            metadata: metadata
                        }
                        state.replaceObject('SpousalRelationship', newRelationship)
                    }}
                    onFinished={() => setMoreDetailsPopupActive(false)}
                    title={<span>Relationship between {spouse1.name} and {spouse2.name}</span>}
                />                    
            </>}
        </header>
    )
}

export default SpousalRelationshipHeader
