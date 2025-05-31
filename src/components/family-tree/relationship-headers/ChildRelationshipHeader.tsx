import HeaderButton from "@/components/building-blocks/header-button/HeaderButton"
import "./RelationshipHeader.scoped.css"
import { useContext, useState } from "react"
import { FamilyTreeStateContext } from "../FamilyTreeState"
import DismissableBlock from "@/components/building-blocks/dismissable-block/DismissableBlock"
import { getEventDate, getPedigree, isMetadataSimple } from "@/lib/family-tree/metadata-helpers"
import { prettyDate } from "@/lib/family-tree/date-utils"
import EditMetadataOverlay from "@/components/overlays/EditMetadataOverlay"
import ViewMetadataOverlay from "@/components/overlays/ViewMetadataOverlay"
import { ChildRelationship } from "@/lib/family-tree/FamilyTreeDatabase"

const ChildRelationshipHeader: React.FC<{  }> = ({  }) => {
    const state = useContext(FamilyTreeStateContext)
    const relationship = state.getObjectById('ChildRelationship', state.focusedChildRelationshipId!)!
    const child = state.getObjectById('Profile', relationship.child_profile_id)!
    const [moreDetailsPopupActive, setMoreDetailsPopupActive] = useState(false)
    const pedigree = getPedigree(relationship.metadata)
    const dateOfAdoption = getEventDate('ADOPTION', relationship.metadata)
    const dateOfFoster = getEventDate('FOSTER', relationship.metadata)

    return (
        <div className="root">
            <DismissableBlock closeButtonTitle="Close relationship details" onDismiss={() => state.setFocusedObjectId('ChildRelationship', null)}>
                <div className="row" style={{ minHeight: 80 }}>
                    <span className="name">Relationship between {child.name} and parents</span>
                    <div className="metadata-row">
                        {pedigree && <div className="metadata">
                            <label>Pedigree</label>
                            <span>{
                                {
                                    'adoptive': 'Adoptive',
                                    'biological': 'Biological',
                                    'foster': 'Foster'
                                }[pedigree]
                            }</span>
                        </div>}
                        {dateOfAdoption && <div className="metadata">
                            <label>Adoption date</label>
                            <span>{prettyDate(dateOfAdoption)}</span>
                        </div>}
                        {dateOfFoster && <div className="metadata">
                            <label>Foster date</label>
                            <span>{prettyDate(dateOfFoster)}</span>
                        </div>}
                    </div>
                </div>
            </DismissableBlock>
            <div className="row">
                {(state.editing || !isMetadataSimple(relationship.metadata, {
                    // TODO: counts as simple if conflicting records are present
                    // maybe just migrate to doubletime for these kinds of checks?
                    PEDIGREE: {},
                    ADOPTION: {
                        DATE: {}
                    },
                    FOSTER: {
                        DATE: {}
                    }
                })) && <>
                    <HeaderButton onClick={() => setMoreDetailsPopupActive(true)}>
                        <span>{state.editing ? 'Edit' : 'View'} details</span>
                    </HeaderButton>
                </>}
                {state.editing && <>
                    <HeaderButton onClick={() => {
                        state.disconnectChild(child)
                        state.setFocusedObjectId('ChildRelationship', null)
                    }}>
                        <span>Break relationship</span>
                    </HeaderButton>
                </>}
            </div>

            {moreDetailsPopupActive && !state.editing && <>
                <ViewMetadataOverlay
                    metadata={relationship.metadata}
                    metadataLookup={id => state.getRootMetadata(id)}
                    onFinished={() => setMoreDetailsPopupActive(false)}
                    title={<span>Relationship between {child.name} and parents</span>}
                />                    
            </>}

            {moreDetailsPopupActive && state.editing && <>
                <EditMetadataOverlay
                    metadata={relationship.metadata}
                    legalRootKeys={[
                        'PEDIGREE',
                        'ADOPTION',
                        'FOSTER',
                        'NOTE'
                    ]}
                    onEditMetadata={(metadata) => {
                        const newRelationship: ChildRelationship = {
                            relationship_id: relationship.relationship_id,
                            parent_relationship_id: relationship.parent_relationship_id,
                            child_profile_id: relationship.child_profile_id,
                            metadata: metadata
                        }
                        state.replaceObject('ChildRelationship', newRelationship)
                    }}
                    onFinished={() => setMoreDetailsPopupActive(false)}
                    title={<span>Relationship between {child.name} and parents</span>}
                />                    
            </>}
        </div>
    )
}

export default ChildRelationshipHeader
