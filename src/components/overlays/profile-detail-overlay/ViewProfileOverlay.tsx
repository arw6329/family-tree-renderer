import { Profile } from "@/lib/family-tree/FamilyTreeDatabase"
import { useContext } from "react"
import { FamilyTreeStateContext } from "../../family-tree/FamilyTreeState"
import Flex from "@/components/building-blocks/flex/Flex"
import ViewMetadataOverlay from "../ViewMetadataOverlay"
import NameAndGender from "@/components/misc/name-and-gender/NameAndGender"

const ViewProfileOverlay: React.FC<{ profile: Profile, onFinished: () => void }> = ({ profile, onFinished }) => {
    const state = useContext(FamilyTreeStateContext)

    return (
        <ViewMetadataOverlay
            metadata={profile.metadata}
            metadataLookup={id => state.getRootMetadata(id)}
            onFinished={onFinished}
            title={
                <Flex gap={10}>
                    <img
                        style={{ width: 50, height: 50, objectFit: 'cover', aspectRatio: 1, borderRadius: 3 }}
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
