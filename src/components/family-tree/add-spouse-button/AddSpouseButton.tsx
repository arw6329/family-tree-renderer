import ModalDialog from "@/components/modal-dialog/ModalDialog"
import AddNodeButton from "../add-node-button/AddNodeButton"
import ProfilePicker from "../profile-picker/ProfilePicker"
import { FamilyTreeStateContext } from "../FamilyTreeState"
import { useContext, useState } from "react"
import { Profile } from "@/lib/family-tree/FamilyTreeDatabase"

const AddSpouseButton: React.FC<{ x: number, y: number, withProfile: Profile }> = ({ x, y, withProfile }) => {
    const state = useContext(FamilyTreeStateContext)
    const [popupActive, setPopupActive] = useState(false)

    return (
        <>
            <AddNodeButton x={x} y={y} onClick={() => setPopupActive(true)} />
            {popupActive && <foreignObject>
                <ModalDialog>
                    <ProfilePicker
                        action="make spouse with April Williams"
                        profiles={state.profiles}
                        onSelectExisting={(profile) => {
                            state.makeSpouses(withProfile, profile)
                            setPopupActive(false)
                        }}
                        onCreateNew={(profile) => {
                            state.addNewProfile(profile)
                            state.makeSpouses(withProfile, profile)
                            setPopupActive(false)
                        }}
                        onCancel={() => setPopupActive(false)}
                    />
                </ModalDialog>
            </foreignObject>}
        </>
    )
}

export default AddSpouseButton
