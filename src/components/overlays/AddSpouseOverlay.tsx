import { useContext } from "react"
import ProfilePicker from "../family-tree/profile-picker/ProfilePicker"
import ModalDialog from "../modal-dialog/ModalDialog"
import { FamilyTreeStateContext } from "../family-tree/FamilyTreeState"
import { Profile } from "@/lib/family-tree/FamilyTreeDatabase"

const AddSpouseOverlay: React.FC<{ withProfile: Profile, onFinished: () => void }> = ({ withProfile, onFinished }) => {
    const state = useContext(FamilyTreeStateContext)

    return (
        <ModalDialog onClose={onFinished}>
            <ProfilePicker
                action={`make spouse with ${withProfile.name}`}
                profiles={state.profiles}
                onSelectExisting={(profile) => {
                    state.makeSpouses(withProfile, profile)
                    onFinished()
                }}
                onCreateNew={(profile) => {
                    state.addNewProfile(profile)
                    state.makeSpouses(withProfile, profile)
                    onFinished()
                }}
                onCancel={() => onFinished()}
            />
        </ModalDialog>
    )
}

export default AddSpouseOverlay
