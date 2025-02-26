import { useContext } from "react"
import RelationshipInfoButton from "./RelationshipInfoButton"
import { FamilyTreeStateContext } from "../FamilyTreeState"
import { SpousalRelationship } from "@/lib/family-tree/FamilyTreeDatabase"

const SpousalRelationshipInfoButton: React.FC<{ x: number, y: number, relationship: SpousalRelationship }> = ({ x, y, relationship }) => {
    const state = useContext(FamilyTreeStateContext)

    return (
        <RelationshipInfoButton
            x={x}
            y={y}
            onClick={() => {
                state.setFocusedObjectId('SpousalRelationship', relationship.relationship_id)
            }}
        />
    )
}

export default SpousalRelationshipInfoButton
