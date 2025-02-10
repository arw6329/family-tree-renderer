import HeaderButton from "@/components/header-button/HeaderButton"
import "./ProfileHeader.scoped.css"
import { Profile } from "@/lib/family-tree/FamilyTreeDatabase"
import { FaVenus } from "react-icons/fa"
import { useContext } from "react"
import { FamilyTreeStateContext } from "../FamilyTreeState"
import { ProfileNode } from "@/lib/family-tree/ProfileNode"

const ProfileHeader: React.FC<{ node: ProfileNode }> = ({ node }) => {
    const state = useContext(FamilyTreeStateContext)
    const profile: Profile = node.data.profile

    return (
        <header>
            <div className="row">
                <img className="profile-pic" src="https://reunionpage.net/sprites/reunionpage-logo.png" alt={`${profile.name}`} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <span className="name">{profile.name}</span>
                        <FaVenus fill="#ffb3c0" height={50} width={100} />
                    </div>
                    <span className="relationship">{profile.name}'s sister</span>
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