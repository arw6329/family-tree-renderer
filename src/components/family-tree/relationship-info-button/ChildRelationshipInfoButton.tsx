import { useContext } from "react"
import RelationshipInfoButton from "./RelationshipInfoButton"
import { FamilyTreeStateContext } from "../FamilyTreeState"
import { ChildRelationship } from "@/lib/family-tree/FamilyTreeDatabase"

const ChildRelationshipInfoButton: React.FC<{ x: number, y: number, relationship: ChildRelationship }> = ({ x, y, relationship }) => {
    const state = useContext(FamilyTreeStateContext)
    const parentsSpousalRelationship = state.getObjectById('SpousalRelationship', relationship.parent_relationship_id)!
    const parent1 = state.getObjectById('Profile', parentsSpousalRelationship.spouse_1_profile_id)!
    const parent2 = state.getObjectById('Profile', parentsSpousalRelationship.spouse_2_profile_id)!
    const child = state.getObjectById('Profile', relationship.child_profile_id)!

    return (
        <RelationshipInfoButton
            x={x}
            y={y}
            ariaLabel={`Relationship between ${parent1.name}, ${parent2.name}, and ${child.name}`}
            onClick={() => {
                state.setFocusedObjectId('ChildRelationship', relationship.relationship_id)
            }}

            focusId={relationship.relationship_id}
            preferredFocusNeigborsUp={[
                parentsSpousalRelationship.relationship_id,
                parentsSpousalRelationship.spouse_1_profile_id,
                parentsSpousalRelationship.spouse_2_profile_id
            ]}
            preferredFocusNeighborsDown={[
                child.profile_id
            ]}
        />
    )
}

export default ChildRelationshipInfoButton
