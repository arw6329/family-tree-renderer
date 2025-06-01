import React, { useContext } from "react"
import "./ParentsSwitcher.scoped.css"
import { FamilyTreeStateContext } from "../FamilyTreeState"
import { ChildRelationship } from "@/lib/family-tree/FamilyTreeDatabase"

const NODE_FOREIGNOBJECT_WIDTH = 300
const NODE_FOREIGNOBJECT_HEIGHT = 30

const ParentsSwitcher: React.FC<{
    x: number
    y: number
    childProfileId: string
    currentRelationshipId: string
    allRelationships: ChildRelationship[]
}> = ({
    x, y,
    childProfileId,
    currentRelationshipId,
    allRelationships
}) => {
    const state = useContext(FamilyTreeStateContext)
    return (
        <foreignObject
            x={x - NODE_FOREIGNOBJECT_WIDTH / 2}
            y={y - NODE_FOREIGNOBJECT_HEIGHT / 2}
            width={NODE_FOREIGNOBJECT_WIDTH}
            height={NODE_FOREIGNOBJECT_HEIGHT}
        >
            <div className="root">
                <span>Family:</span>
                <select
                    defaultValue={currentRelationshipId}
                    onChange={event => {
                        console.log('changed')
                        state.setActiveChildRelationshipForProfile(childProfileId, event.target.value)
                    }}
                >
                    {allRelationships.map(relationship => {
                        const parentRelationship = state.getObjectById('SpousalRelationship', relationship.parent_relationship_id)
                        const spouse1 = state.getObjectById('Profile', parentRelationship.spouse_1_profile_id)
                        const spouse2 = state.getObjectById('Profile', parentRelationship.spouse_2_profile_id)
                        return <>
                            <option key={relationship.relationship_id} value={relationship.relationship_id}>
                                {spouse1?.name ?? '<missing name>'} and {spouse2?.name ?? '<missing name>'}
                            </option>
                        </>
                    })}
                </select>
            </div>
        </foreignObject>
    )
}

export default ParentsSwitcher
