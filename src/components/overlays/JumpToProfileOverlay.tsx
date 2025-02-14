import { useContext } from "react"
import ProfilePicker from "../family-tree/profile-picker/ProfilePicker"
import ModalDialog from "../modal-dialog/ModalDialog"
import { FamilyTreeStateContext } from "../family-tree/FamilyTreeState"

const JumpToProfileOverlay: React.FC<{ onFinished: () => void }> = ({ onFinished }) => {
    const state = useContext(FamilyTreeStateContext)

    return (
        <ModalDialog onClose={onFinished}>
            <ProfilePicker
                action="center tree on"
                profiles={state.profiles}
                validModes="select"
                onSelectExisting={(profile) => {
                    state.setRootProfile(profile)
                    onFinished()
                }}
                onCancel={() => onFinished()}
            />
        </ModalDialog>
    )
}

export default JumpToProfileOverlay
