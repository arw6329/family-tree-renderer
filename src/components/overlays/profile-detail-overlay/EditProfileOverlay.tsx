import { Profile } from "@/lib/family-tree/FamilyTreeDatabase"
import { useContext, useState } from "react"
import { FamilyTreeStateContext } from "../../family-tree/FamilyTreeState"
import EditMetadataOverlay from "../EditMetadataOverlay"
import LabeledElement from "@/components/building-blocks/labeled-text/LabeledText"
import Flex from "@/components/building-blocks/flex/Flex"

const EditProfileOverlay: React.FC<{ profile: Profile, onFinished: () => void }> = ({ profile, onFinished }) => {
    const state = useContext(FamilyTreeStateContext)

    const [name, setName] = useState(profile.name)
    const [gender, setGender] = useState(profile.family_tree_gender)

    return (
        <EditMetadataOverlay
            metadata={profile.metadata}
            legalRootKeys={[
                'BIRTH',
                'DEATH',
                'BURIAL',
                'CREMATION',
                'NOTE'
            ]}
            onEditMetadata={(metadata) => {
                const newProfile: Profile = {
                    profile_id: profile.profile_id,
                    name: name,
                    family_tree_gender: gender,
                    metadata: metadata
                }
                state.replaceObject('Profile', newProfile)
            }}
            onFinished={onFinished}
            title={
                <Flex gap={10} alignItems="center">
                    <img style={{ width: 50, height: 50, objectFit: 'cover', aspectRatio: 1, borderRadius: 3 }} />
                    <input
                        type="text"
                        placeholder="Name"
                        defaultValue={profile.name}
                        style={{ fontSize: '1.4rem' }}
                        onChange={(event) => setName(event.target.value)}
                    />
                    <LabeledElement label="Gender">
                        <select
                            defaultValue={profile.family_tree_gender}
                            onChange={(event) => setGender(event.target.value as Profile['family_tree_gender'])}
                        >
                            <option value="FEMALE">Female</option>
                            <option value="MALE">Male</option>
                            <option value="NONBINARY">Non-binary</option>
                            <option value="NEUTRAL">Unknown/not specified</option>
                        </select>
                    </LabeledElement>
                </Flex>
            }
        />
    )
}

export default EditProfileOverlay
