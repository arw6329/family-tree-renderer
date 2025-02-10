import HeaderButton from "@/components/header-button/HeaderButton"
import "./ProfileHeader.scoped.css"
import { Profile } from "@/lib/family-tree/FamilyTreeDatabase"
import { FaMars, FaVenus } from "react-icons/fa"
import { useContext } from "react"
import { FamilyTreeStateContext } from "../FamilyTreeState"
import { ProfileNode } from "@/lib/family-tree/ProfileNode"
import { IconContext } from "react-icons"
import { relation_to } from "@/lib/family-tree/relation"

const ProfileHeader: React.FC<{ node: ProfileNode }> = ({ node }) => {
    const state = useContext(FamilyTreeStateContext)
    const profile: Profile = node.data.profile

    const relationToRoot = relation_to(node, state.rootNode)

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
            </div>
            <div className="row">
                <HeaderButton onClick={() => state.setRootNode(node)}>
                    <span>Recenter tree here</span>
                </HeaderButton>
            </div>
        </header>
    )
}

export default ProfileHeader