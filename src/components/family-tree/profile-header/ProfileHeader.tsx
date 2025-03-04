import HeaderButton from "@/components/building-blocks/header-button/HeaderButton"
import "./ProfileHeader.scoped.css"
import { Profile, SpousalRelationship } from "@/lib/family-tree/FamilyTreeDatabase"
import { FaMars, FaVenus } from "react-icons/fa"
import { TbGenderGenderqueer } from "react-icons/tb"
import { useContext, useMemo, useState } from "react"
import { FamilyTreeStateContext } from "../FamilyTreeState"
import { ProfileNode } from "@/lib/family-tree/ProfileNode"
import { IconContext } from "react-icons"
import { relation_to } from "@/lib/family-tree/relation"
import AddSpouseOverlay from "@/components/overlays/AddSpouseOverlay"
import AddChildOverlay from "@/components/overlays/AddChildOverlay"
import AddParentsOverlay from "@/components/overlays/AddParentsOverlay"
import ProfileDetailOverlay from "@/components/overlays/profile-detail-overlay/ProfileDetailOverlay"
import { getBirthDate, getDeathDate } from "@/lib/family-tree/metadata-helpers"
import { prettyDate } from "@/lib/family-tree/date-utils"
import DismissableBlock from "@/components/building-blocks/dismissable-block/DismissableBlock"

const ProfileHeader: React.FC<{ node: ProfileNode }> = ({ node }) => {
    const state = useContext(FamilyTreeStateContext)
    const [addSpousePopupActive, setAddSpousePopupActive] = useState(false)
    const [addParentsPopupActive, setAddParentsPopupActive] = useState(false)
    const [moreDetailsPopupActive, setMoreDetailsPopupActive] = useState(false)
    const [addingChildWithRelationship, setAddingChildWithRelationship] = useState<SpousalRelationship | null>(null)
    const profile: Profile = node.data.profile

    const relationToRoot = useMemo(() => {
        return relation_to(node, state.rootNode)
    }, [node, state.rootNode])

    const spouses = state.getSpousesOf(profile)

    const dateOfBirth = getBirthDate(profile.metadata)
    const dateOfDeath = getDeathDate(profile.metadata)

    return (
        <header>
            <DismissableBlock closeButtonTitle="Close profile details" onDismiss={() => state.setFocusedObjectId('Profile', null)}>
                <div className="row">
                    <img className="profile-pic" src={state.getProfilePictureURL(profile)} alt={`${profile.name}`} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span className="name">{profile.name}</span>
                            {profile.family_tree_gender === 'FEMALE'
                                && <IconContext.Provider value={{ style: { height: 25 } }}>
                                    <FaVenus fill="#ffb3c0" aria-label="Female gender symbol" />
                                </IconContext.Provider>}
                            {profile.family_tree_gender === 'MALE'
                                && <IconContext.Provider value={{ style: { height: 27, width: 22 } }}>
                                    <FaMars fill="cornflowerblue" aria-label="Male gender symbol" />
                                </IconContext.Provider>}
                            {profile.family_tree_gender === 'NONBINARY'
                                && <IconContext.Provider value={{ style: { height: 28, width: 28, margin: '0 -5px' } }}>
                                    <TbGenderGenderqueer stroke="yellow" aria-label="Nonbinary gender symbol" />
                                </IconContext.Provider>}
                        </div>
                        {relationToRoot && <span className="relationship">{state.rootNode.data.profile.name}&apos;s {relationToRoot.text}</span>}
                    </div>
                    <div className="metadata-row">
                        {dateOfBirth && <div className="metadata">
                            <label>Date of birth</label>
                            <span>{prettyDate(dateOfBirth)}</span>
                        </div>}
                        {dateOfDeath && <div className="metadata">
                            <label>Date of death</label>
                            <span>{prettyDate(dateOfDeath)}</span>
                        </div>}
                    </div>
                </div>
            </DismissableBlock>
            <div className="row">
                <HeaderButton onClick={() => state.setRootProfile(profile)}>
                    <span>Recenter tree here</span>
                </HeaderButton>
                {state.editing && <>
                    <HeaderButton onClick={() => setMoreDetailsPopupActive(true)}>
                        <span>Edit details</span>
                    </HeaderButton>
                    <HeaderButton onClick={() => setAddSpousePopupActive(true)}>
                        <span>Add spouse</span>
                    </HeaderButton>
                    {state.hasParents(profile)
                        ? <HeaderButton onClick={() => state.disconnectChild(profile)}>
                            <span>Disconnect from parents</span>
                        </HeaderButton>
                        : <HeaderButton onClick={() => setAddParentsPopupActive(true)}>
                            <span>Add parents</span>
                        </HeaderButton>
                    }
                    {spouses.map(spouse => (
                        <HeaderButton onClick={() => setAddingChildWithRelationship(spouse.relationship)}>
                            <span>Add child with {spouse.spouse.name}</span>
                        </HeaderButton>
                    ))}
                    {spouses.map(spouse => (
                        <HeaderButton onClick={() => state.disconnectSpouses(spouse.relationship)}>
                            <span>Disconnect from {spouse.spouse.name}</span>
                        </HeaderButton>
                    ))}
                </>}
            </div>
            
            {addSpousePopupActive && <>
                <AddSpouseOverlay
                    withProfile={profile}
                    onFinished={() => setAddSpousePopupActive(false)}
                />
            </>}
            {addParentsPopupActive && <>
                <AddParentsOverlay
                    profile={profile}
                    onFinished={() => setAddParentsPopupActive(false)}
                />
            </>}
            {addingChildWithRelationship && <>
                <AddChildOverlay
                    parentRelationship={addingChildWithRelationship}
                    onFinished={() => setAddingChildWithRelationship(null)}
                />
            </>}

            {moreDetailsPopupActive && <>
                <ProfileDetailOverlay
                    profile={profile}
                    onFinished={() => setMoreDetailsPopupActive(false)}
                />
            </>}
        </header>
    )
}

export default ProfileHeader