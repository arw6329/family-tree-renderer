import { useContext } from "react"
import RelationshipInfoButton from "./RelationshipInfoButton"
import { FamilyTreeStateContext } from "../FamilyTreeState"
import { SpousalRelationship } from "@/lib/family-tree/FamilyTreeDatabase"

const SpousalRelationshipInfoButton: React.FC<{ x: number, y: number, relationship: SpousalRelationship }> = ({ x, y, relationship }) => {
    const state = useContext(FamilyTreeStateContext)
    const spouse1 = state.getObjectById('Profile', relationship.spouse_1_profile_id)!
    const spouse2 = state.getObjectById('Profile', relationship.spouse_2_profile_id)!

    if(!state.editing && relationship.metadata.length === 0) {
        return
    }

    return (
        <RelationshipInfoButton
            x={x}
            y={y}
            ariaLabel={`Relationship between ${spouse1.name} and ${spouse2.name}`}
            onClick={() => {
                state.setFocusedObjectId('SpousalRelationship', relationship.relationship_id)
            }}

            focusId={relationship.relationship_id}
            preferredFocusNeighborsDown={
                // TODO: this is inefficient, data could be accessed from a FamilyTreeNode instead
                // of searching the entire db
                state.getChildrenOf(relationship)
                .flatMap(child => [
                    child.relationship.relationship_id,
                    child.child.profile_id
                ])
            }
        />
    )
}

export default SpousalRelationshipInfoButton
