import { useContext } from "react"
import ProfilePicker from "../family-tree/profile-picker/ProfilePicker"
import ModalDialog from "../building-blocks/modal-dialog/ModalDialog"
import { FamilyTreeStateContext } from "../family-tree/FamilyTreeState"
import { SpousalRelationship } from "@/lib/family-tree/FamilyTreeDatabase"

const AddChildOverlay: React.FC<{ parentRelationship: SpousalRelationship, onFinished: () => void }> = ({ parentRelationship, onFinished }) => {
    const state = useContext(FamilyTreeStateContext)

    return (
        <ModalDialog onClose={onFinished}>
            <ProfilePicker
                action={`make child of ${state.getProfile(parentRelationship.spouse_1_profile_id).name} and ${state.getProfile(parentRelationship.spouse_2_profile_id).name}`}
                profiles={state.profiles}
                onSelectExisting={(profile) => {
                    state.makeChild(parentRelationship, profile)
                    onFinished()
                }}
                onCreateNew={(profile) => {
                    state.addNewProfile(profile)
                    state.makeChild(parentRelationship, profile)
                    onFinished()
                }}
                onCancel={() => onFinished()}
            />
        </ModalDialog>
    )
}

export default AddChildOverlay
