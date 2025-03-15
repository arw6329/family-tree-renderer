import { Profile } from "@/lib/family-tree/FamilyTreeDatabase"
import { useContext } from "react"
import { FamilyTreeStateContext } from "../../family-tree/FamilyTreeState"
import Flex from "@/components/building-blocks/flex/Flex"
import ViewMetadataOverlay from "../ViewMetadataOverlay"
import NameAndGender from "@/components/family-tree/profile-header/NameAndGender"

const ViewProfileOverlay: React.FC<{ profile: Profile, onFinished: () => void }> = ({ profile, onFinished }) => {
    const state = useContext(FamilyTreeStateContext)

    return (
        <ViewMetadataOverlay
            metadata={profile.metadata}
            onFinished={onFinished}
            title={
                <Flex gap={10}>
                    <img
                        style={{ width: 50, height: 50, objectFit: 'contain' }}
                        src={state.getProfilePictureURL(profile)}
                        alt={`${profile.name}`}
                    />
                    <NameAndGender profile={profile} />
                </Flex>
            }
        />
    )
}

export default ViewProfileOverlay
