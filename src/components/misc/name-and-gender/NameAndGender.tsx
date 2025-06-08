import GenderSymbol from "@/components/GenderSymbol"
import { Profile } from "@/lib/family-tree/FamilyTreeDatabase"
import "./NameAndGender.scoped.css"

const NameAndGender: React.FC<{
    profile: Profile
    size?: 'large' | 'small'
}> = ({ profile, size = 'large' }) => {
    return (
        <div className="root">
            <span style={{ fontSize: size === 'large' ? '1.4rem' : '1.2rem', color: 'white' }}>{profile.name}</span>
            <GenderSymbol gender={profile.family_tree_gender} size={size} />
        </div>
    )
}

export default NameAndGender
