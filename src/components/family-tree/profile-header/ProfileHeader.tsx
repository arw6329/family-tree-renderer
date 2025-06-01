import HeaderButton from "@/components/building-blocks/header-button/HeaderButton"
import "./ProfileHeader.scoped.css"
import { Profile, SpousalRelationship } from "@/lib/family-tree/FamilyTreeDatabase"
import { useContext, useMemo, useState } from "react"
import { FamilyTreeStateContext } from "../FamilyTreeState"
import { ProfileNode } from "@/lib/family-tree/ProfileNode"
import { relation_to } from "@/lib/family-tree/relation"
import AddSpouseOverlay from "@/components/overlays/AddSpouseOverlay"
import AddChildOverlay from "@/components/overlays/AddChildOverlay"
import AddParentsOverlay from "@/components/overlays/AddParentsOverlay"
import DismissableBlock from "@/components/building-blocks/dismissable-block/DismissableBlock"
import SimpleMetadataRow from "./SimpleMetadataRow"
import NameAndGender from "./NameAndGender"
import EditProfileOverlay from "@/components/overlays/profile-detail-overlay/EditProfileOverlay"
import ViewProfileOverlay from "@/components/overlays/profile-detail-overlay/ViewProfileOverlay"
import { isMetadataSimple } from "@/lib/family-tree/metadata-helpers"
import Flex from "@/components/building-blocks/flex/Flex"

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

    return (
        <div className="root">
            <DismissableBlock closeButtonTitle="Close profile details" onDismiss={() => state.setFocusedObjectId('Profile', null)}>
                <Flex column={true} gap={10}>
                    <Flex gap={10} style={{ borderBottom: '1px solid #3a3d3fab', paddingBottom: 10 }}>
                        <img className="profile-pic" src={state.getProfilePictureURL(profile)} alt={`${profile.name}`} />
                        <Flex column={true} gap={6}>
                            <NameAndGender profile={profile} />
                            {relationToRoot && <span className="relationship">{state.rootNode.data.profile.name}&apos;s {relationToRoot.text}</span>}
                        </Flex>
                    </Flex>
                    <SimpleMetadataRow metadata={profile.metadata} />
                </Flex>
            </DismissableBlock>
            <Flex gap={10} wrap={true}>
                <HeaderButton onClick={() => state.setRootProfileId(profile.profile_id)}>
                    <span>Recenter tree here</span>
                </HeaderButton>
                {(state.editing || !isMetadataSimple(profile.metadata, {
                    BIRTH: {
                        DATE: {}
                    },
                    DEATH: {
                        DATE: {}
                    }
                })) && <>
                    <HeaderButton onClick={() => setMoreDetailsPopupActive(true)}>
                        <span>{state.editing ? 'Edit' : 'View'} details</span>
                    </HeaderButton>
                </>}
                {state.editing && <>
                    <HeaderButton onClick={() => setAddSpousePopupActive(true)}>
                        <span>Add spouse</span>
                    </HeaderButton>
                    {node.relationship_data.own_child_relationship &&
                        <HeaderButton onClick={() => state.disconnectChild(node.relationship_data.own_child_relationship!)}>
                            <span>Disconnect from parents</span>
                        </HeaderButton>}
                    <HeaderButton onClick={() => setAddParentsPopupActive(true)}>
                        <span>Add parents</span>
                    </HeaderButton>
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
            </Flex>
            
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

            {moreDetailsPopupActive && !state.editing && <ViewProfileOverlay
                profile={profile}
                onFinished={() => setMoreDetailsPopupActive(false)}
            />}

            {moreDetailsPopupActive && state.editing && <EditProfileOverlay
                profile={profile}
                onFinished={() => setMoreDetailsPopupActive(false)}
            />}
        </div>
    )
}

export default ProfileHeader