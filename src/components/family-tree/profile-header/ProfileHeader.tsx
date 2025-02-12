import HeaderButton from "@/components/header-button/HeaderButton"
import "./ProfileHeader.scoped.css"
import { Profile, SpousalRelationship } from "@/lib/family-tree/FamilyTreeDatabase"
import { FaMars, FaVenus } from "react-icons/fa"
import { FaXmark } from "react-icons/fa6"
import { useContext, useMemo, useState } from "react"
import { FamilyTreeStateContext } from "../FamilyTreeState"
import { ProfileNode } from "@/lib/family-tree/ProfileNode"
import { IconContext } from "react-icons"
import { relation_to } from "@/lib/family-tree/relation"
import AddSpouseOverlay from "@/components/overlays/AddSpouseOverlay"
import AddChildOverlay from "@/components/overlays/AddChildOverlay"
import AddParentsOverlay from "@/components/overlays/AddParentsOverlay"

const ProfileHeader: React.FC<{ node: ProfileNode }> = ({ node }) => {
    const state = useContext(FamilyTreeStateContext)
    const [addSpousePopupActive, setAddSpousePopupActive] = useState(false)
    const [addParentsPopupActive, setAddParentsPopupActive] = useState(false)
    const [addingChildWithRelationship, setAddingChildWithRelationship] = useState<SpousalRelationship | null>(null)
    const profile: Profile = node.data.profile

    const relationToRoot = useMemo(() => {
        return relation_to(node, state.rootNode)
    }, [node, state.rootNode])

    const spouses = state.getSpousesOf(profile)

    return (
        <header>
            <div className="row">
                <img className="profile-pic" src="https://reunionpage.net/sprites/reunionpage-logo.png" alt={`${profile.name}`} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span className="name">{profile.name}</span>
                        {profile.family_tree_gender === 'FEMALE'
                            && <IconContext.Provider value={{ style: { height: 25 } }}>
                                <FaVenus fill="#ffb3c0" />
                            </IconContext.Provider>}
                        {profile.family_tree_gender === 'MALE'
                            && <IconContext.Provider value={{ style: { height: 27, width: 22 } }}>
                                <FaMars fill="cornflowerblue" />
                            </IconContext.Provider>}
                    </div>
                    {relationToRoot && <span className="relationship">{state.rootNode.data.profile.name}'s {relationToRoot.text}</span>}
                </div>
                <div style={{ flexGrow: 1 }}/>
                <button className="close-button" title="Close profile details" onClick={() => state.setFocusedProfileNode(null)}>
                    <IconContext.Provider value={{ style: { height: 22, width: 22 } }}>
                        <FaXmark fill="white" />
                    </IconContext.Provider>
                </button>
            </div>
            <div className="row">
                <HeaderButton onClick={() => state.setRootProfile(profile)}>
                    <span>Recenter tree here</span>
                </HeaderButton>
                {state.editing && <>
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
        </header>
    )
}

export default ProfileHeader