import HeaderButton from "@/components/building-blocks/header-button/HeaderButton"
import "./RelationshipHeader.scoped.css"
import { useContext } from "react"
import { FamilyTreeStateContext } from "../FamilyTreeState"
import DismissableBlock from "@/components/building-blocks/dismissable-block/DismissableBlock"

const ChildRelationshipHeader: React.FC<{  }> = ({  }) => {
    const state = useContext(FamilyTreeStateContext)
    const relationship = state.getObjectById('ChildRelationship', state.focusedChildRelationshipId!)!
    const parentsSpousalRelationship = state.getObjectById('SpousalRelationship', relationship.parent_relationship_id)!
    const parent1 = state.getObjectById('Profile', parentsSpousalRelationship.spouse_1_profile_id)!
    const parent2 = state.getObjectById('Profile', parentsSpousalRelationship.spouse_2_profile_id)!
    const child = state.getObjectById('Profile', relationship.child_profile_id)!

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
                </>}
            </div>
        </header>
    )
}

export default ChildRelationshipHeader
