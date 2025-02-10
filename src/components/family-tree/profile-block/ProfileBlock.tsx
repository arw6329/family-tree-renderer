import React, { useContext } from "react"
import "./ProfileBlock.scoped.css"
import { Profile } from "@/lib/family-tree/FamilyTreeDatabase"
import { FamilyTreeStateContext } from "../FamilyTreeState"
import { ProfileNode } from "@/lib/family-tree/ProfileNode"

const NODE_FOREIGNOBJECT_WIDTH = 175
const NODE_FOREIGNOBJECT_HEIGHT = 75

const ProfileBlock: React.FC<{ x: number, y: number, node: ProfileNode }> = ({x, y, node}) => {
    const state = useContext(FamilyTreeStateContext)
    const profile: Profile = node.data.profile

    return (
        <foreignObject
            x={x - NODE_FOREIGNOBJECT_WIDTH / 2}
            y={y - NODE_FOREIGNOBJECT_HEIGHT / 2}
            width={NODE_FOREIGNOBJECT_WIDTH}
            height={NODE_FOREIGNOBJECT_HEIGHT}
        >
            <button onClick={() => state.setFocusedProfileNode(node)}>
                <div
                    className="root"
                    data-gender={profile.family_tree_gender}
                    data-anchor={state.rootNode.data.profile.profile_id === profile.profile_id}
                    data-focus={state.focusedProfileNode === node}
                >
                    <div className="img-wrapper">
                        <img src="https://reunionpage.net/sprites/reunionpage-logo.png" alt={`${profile.name}`} />
                    </div>
                    <div className="column">
                        <span>{profile.name}</span>
                    </div>
                </div>
            </button>
        </foreignObject>
    )
}

export default ProfileBlock