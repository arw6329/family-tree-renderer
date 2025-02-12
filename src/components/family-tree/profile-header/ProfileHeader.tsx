import HeaderButton from "@/components/header-button/HeaderButton"
import "./ProfileHeader.scoped.css"
import { Profile } from "@/lib/family-tree/FamilyTreeDatabase"
import { FaMars, FaVenus } from "react-icons/fa"
import { FaXmark } from "react-icons/fa6"
import { useContext, useMemo, useState } from "react"
import { FamilyTreeStateContext } from "../FamilyTreeState"
import { ProfileNode } from "@/lib/family-tree/ProfileNode"
import { IconContext } from "react-icons"
import { relation_to } from "@/lib/family-tree/relation"
import AddSpouseOverlay from "@/components/overlays/AddSpouseOverlay"

const ProfileHeader: React.FC<{ node: ProfileNode }> = ({ node }) => {
    const state = useContext(FamilyTreeStateContext)
    const [addSpousePopupActive, setAddSpousePopupActive] = useState(false)
    const profile: Profile = node.data.profile

    const relationToRoot = useMemo(() => {
        return relation_to(node, state.rootNode)
    }, [node, state.rootNode])

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
                {state.editing &&
                    <HeaderButton onClick={() => setAddSpousePopupActive(true)}>
                        <span>Add spouse</span>
                    </HeaderButton>}
            </div>
            
            {addSpousePopupActive && <AddSpouseOverlay withProfile={profile} onFinished={() => setAddSpousePopupActive(false)} />}
        </header>
    )
}

export default ProfileHeader