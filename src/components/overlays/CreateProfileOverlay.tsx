import { useContext } from "react"
import ProfilePicker from "../family-tree/profile-picker/ProfilePicker"
import ModalDialog from "../building-blocks/modal-dialog/ModalDialog"
import { FamilyTreeStateContext } from "../family-tree/FamilyTreeState"

const CreateProfileOverlay: React.FC<{ onFinished: () => void }> = ({ onFinished }) => {
    const state = useContext(FamilyTreeStateContext)

    return (
        <ModalDialog onClose={onFinished}>
            <ProfilePicker
                action="add to tree"
                profiles={state.profiles}
                validModes="create"
                onCreateNew={(profile) => {
                    state.addNewProfile(profile)
                    state.setRootProfile(profile)
                    onFinished()
                }}
                onCancel={() => onFinished()}
            />
        </ModalDialog>
    )
}

export default CreateProfileOverlay
