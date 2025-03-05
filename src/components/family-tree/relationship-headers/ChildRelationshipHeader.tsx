import HeaderButton from "@/components/building-blocks/header-button/HeaderButton"
import "./RelationshipHeader.scoped.css"
import { useContext, useState } from "react"
import { FamilyTreeStateContext } from "../FamilyTreeState"
import DismissableBlock from "@/components/building-blocks/dismissable-block/DismissableBlock"
import ChildRelationshipDetailOverlay from "@/components/overlays/child-relationship-detail-overlay/ChildRelationshipDetailOverlay"

const ChildRelationshipHeader: React.FC<{  }> = ({  }) => {
    const state = useContext(FamilyTreeStateContext)
    const relationship = state.getObjectById('ChildRelationship', state.focusedChildRelationshipId!)!
    const parentsSpousalRelationship = state.getObjectById('SpousalRelationship', relationship.parent_relationship_id)!
    const parent1 = state.getObjectById('Profile', parentsSpousalRelationship.spouse_1_profile_id)!
    const parent2 = state.getObjectById('Profile', parentsSpousalRelationship.spouse_2_profile_id)!
    const child = state.getObjectById('Profile', relationship.child_profile_id)!
    const [moreDetailsPopupActive, setMoreDetailsPopupActive] = useState(false)

    return (
        <header>
            <DismissableBlock closeButtonTitle="Close relationship details" onDismiss={() => state.setFocusedObjectId('ChildRelationship', null)}>
                <div className="row" style={{ minHeight: 80 }}>
                    <span className="name">Relationship between<br />{parent1.name}, {parent2.name}, and {child.name}</span>
                    <div className="metadata-row">
                        
                    </div>
                </div>
            </DismissableBlock>
            <div className="row">
                {state.editing && <>
                    <HeaderButton onClick={() => {
                        state.disconnectChild(child)
                        state.setFocusedObjectId('ChildRelationship', null)
                    }}>
                        <span>Break relationship</span>
                    </HeaderButton>
                    <HeaderButton onClick={() => setMoreDetailsPopupActive(true)}>
                        <span>Edit details</span>
                    </HeaderButton>
                </>}
            </div>

            {moreDetailsPopupActive && <>
                <ChildRelationshipDetailOverlay
                    relationship={relationship}
                    onFinished={() => setMoreDetailsPopupActive(false)}
                />
            </>}
        </header>
    )
}

export default ChildRelationshipHeader
