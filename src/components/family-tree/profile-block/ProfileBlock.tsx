import React from "react"
import "./ProfileBlock.scoped.css"
import { Profile } from "@/lib/family-tree/FamilyTreeDatabase"

const NODE_FOREIGNOBJECT_WIDTH = 175
const NODE_FOREIGNOBJECT_HEIGHT = 75

const genderColors = {
    FEMALE: '#ffb3c0',
    MALE: '#9ec0ff',
    NEUTRAL: '#ffffff',
    NONBINARY: 'yellow'
}

const ProfileBlock: React.FC<{ x: number, y: number, profile: Profile }> = ({x, y, profile}) => {
    return (
        <foreignObject
            x={x - NODE_FOREIGNOBJECT_WIDTH / 2}
            y={y - NODE_FOREIGNOBJECT_HEIGHT / 2}
            width={NODE_FOREIGNOBJECT_WIDTH}
            height={NODE_FOREIGNOBJECT_HEIGHT}
        >
            <div className="root" style={{
                color: genderColors[profile.family_tree_gender],
                borderColor: genderColors[profile.family_tree_gender]
            }}>
                <div className="img-wrapper">
                    <img src="https://reunionpage.net/sprites/reunionpage-logo.png" alt={`${profile.name}`} />
                </div>
                <div className="column">
                    <span>{profile.name}</span>
                </div>
            </div>
        </foreignObject>
    )
}

export default ProfileBlock