import React, { useContext } from "react"
import "./ProfileBlock.scoped.css"
import { Profile } from "@/lib/family-tree/FamilyTreeDatabase"
import { FamilyTreeStateContext } from "../FamilyTreeState"
import { ProfileNode } from "@/lib/family-tree/ProfileNode"
import { prettyDateShortYearOnly } from "@/lib/family-tree/date-utils"
import { getEventDate } from "@/lib/family-tree/metadata-helpers"

const NODE_FOREIGNOBJECT_WIDTH = 175
const NODE_FOREIGNOBJECT_HEIGHT = 75

const ProfileBlock: React.FC<{ x: number, y: number, node: ProfileNode }> = ({x, y, node}) => {
    const state = useContext(FamilyTreeStateContext)
    const profile: Profile = node.data.profile
    const isAnchorNode = state.rootNode.data.profile.profile_id === profile.profile_id

    const birthDate = getEventDate('BIRTH', profile.metadata)
    const birthYear = birthDate && prettyDateShortYearOnly(birthDate)
    const deathDate = getEventDate('DEATH', profile.metadata)
    const deathYear = deathDate && prettyDateShortYearOnly(deathDate)

    return (
        <foreignObject
            x={x - NODE_FOREIGNOBJECT_WIDTH / 2}
            y={y - NODE_FOREIGNOBJECT_HEIGHT / 2}
            width={NODE_FOREIGNOBJECT_WIDTH}
            height={NODE_FOREIGNOBJECT_HEIGHT}
        >
            <button
                onClick={() => state.setFocusedObjectId('Profile', profile.profile_id)}
                aria-label={`View details for ${profile.name}`}
                {...(isAnchorNode && { 'aria-keyshortcuts': 'Alt+Shift+A' })}
            >
                <div
                    className="root"
                    data-gender={profile.family_tree_gender}
                    data-anchor={isAnchorNode}
                    data-focus={state.focusedProfileId === profile.profile_id}
                >
                    <div className="img-wrapper">
                        <img src={state.getProfilePictureURL(profile)} alt={`Image of ${profile.name}`} loading="lazy" />
                    </div>
                    <div className="column">
                        <span>{profile.name}</span>
                        {(birthYear !== null || deathYear !== null) && <span className="date-range">{birthYear ?? '?'} - {deathYear ?? '?'}</span>}
                    </div>
                </div>
            </button>
        </foreignObject>
    )
}

export default ProfileBlock