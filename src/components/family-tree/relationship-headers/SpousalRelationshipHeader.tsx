import HeaderButton from "@/components/header-button/HeaderButton"
import "./RelationshipHeader.scoped.css"
import { FaXmark } from "react-icons/fa6"
import { useContext, useState } from "react"
import { FamilyTreeStateContext } from "../FamilyTreeState"
import { IconContext } from "react-icons"
import AddChildOverlay from "@/components/overlays/AddChildOverlay"
import DismissableBlock from "@/components/dismissable-block/DismissableBlock"

const SpousalRelationshipHeader: React.FC<{  }> = ({  }) => {
    const state = useContext(FamilyTreeStateContext)
    const [addChildOverlayActive, setAddChildOverlayActive] = useState(false)

    const relationship = state.getObjectById('SpousalRelationship', state.focusedSpousalRelationshipId!)!
    const spouse1 = state.getObjectById('Profile', relationship.spouse_1_profile_id)!
    const spouse2 = state.getObjectById('Profile', relationship.spouse_2_profile_id)!

    return (
        <header>
            <DismissableBlock closeButtonTitle="Close relationship details" onDismiss={() => state.setFocusedObjectId('SpousalRelationship', null)}>
                <div className="row" style={{ minHeight: 80 }}>
                    <span className="name">Relationship between<br />{spouse1.name} and {spouse2.name}</span>
                    <div className="metadata-row">
                        
                    </div>
                </div>
            </DismissableBlock>
            <div className="row">
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
        </header>
    )
}

export default SpousalRelationshipHeader
