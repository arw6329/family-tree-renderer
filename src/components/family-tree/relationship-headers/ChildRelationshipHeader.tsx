import HeaderButton from "@/components/header-button/HeaderButton"
import "./RelationshipHeader.scoped.css"
import { FaXmark } from "react-icons/fa6"
import { useContext } from "react"
import { FamilyTreeStateContext } from "../FamilyTreeState"
import { IconContext } from "react-icons"

const ChildRelationshipHeader: React.FC<{  }> = ({  }) => {
    const state = useContext(FamilyTreeStateContext)
    const relationship = state.getObjectById('ChildRelationship', state.focusedChildRelationshipId!)!
    const parentsSpousalRelationship = state.getObjectById('SpousalRelationship', relationship.parent_relationship_id)!
    const parent1 = state.getObjectById('Profile', parentsSpousalRelationship.spouse_1_profile_id)!
    const parent2 = state.getObjectById('Profile', parentsSpousalRelationship.spouse_2_profile_id)!
    const child = state.getObjectById('Profile', relationship.child_profile_id)!

    return (
        <header>
            <div className="row" style={{ minHeight: 80 }}>
                <span className="name">Relationship between<br />{parent1.name}, {parent2.name}, and {child.name}</span>
                <div className="metadata-row">
                    
                </div>
                <button className="close-button" title="Close relationship details" onClick={() => state.setFocusedObjectId('ChildRelationship', null)}>
                    <IconContext.Provider value={{ style: { height: 22, width: 22 } }}>
                        <FaXmark fill="white" />
                    </IconContext.Provider>
                </button>
            </div>
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
