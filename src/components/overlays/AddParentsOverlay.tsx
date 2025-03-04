import { useContext, useState } from "react"
import ProfilePicker from "../family-tree/profile-picker/ProfilePicker"
import ModalDialog from "../building-blocks/modal-dialog/ModalDialog"
import { FamilyTreeStateContext } from "../family-tree/FamilyTreeState"
import { Profile } from "@/lib/family-tree/FamilyTreeDatabase"
import StageTracker from "../building-blocks/stage-tracker/StageTracker"

interface SelectedParent {
    newlyCreated: boolean,
    profile: Profile
}

const AddParentsOverlay: React.FC<{ profile: Profile, onFinished: () => void }> = ({ profile, onFinished }) => {
    const state = useContext(FamilyTreeStateContext)
    const [firstParent, setFirstParent] = useState<SelectedParent | null>(null)

    function makeParents(parent1: SelectedParent, parent2: SelectedParent) {
        if(parent1.newlyCreated) {
            state.addNewProfile(parent1.profile)
        }
        if(parent2.newlyCreated) {
            state.addNewProfile(parent2.profile)
        }

        let parentsSpousalRelationship = state.getRelationshipBetween(parent1.profile, parent2.profile)

        if(parentsSpousalRelationship === null) {
            parentsSpousalRelationship = state.makeSpouses(parent1.profile, parent2.profile)
        }

        state.makeChild(parentsSpousalRelationship, profile)
    }

    return (
        <ModalDialog onClose={onFinished}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
                <StageTracker stageCount={2} stage={firstParent ? 2 : 1} />
                {
                    firstParent === null
                    ? <ProfilePicker
                        action={`make first parent of ${profile.name}`}
                        profiles={state.profiles}
                        onSelectExisting={(profile) => {
                            setFirstParent({
                                newlyCreated: false,
                                profile
                            })
                        }}
                        onCreateNew={(profile) => {
                            setFirstParent({
                                newlyCreated: true,
                                profile
                            })
                        }}
                        onCancel={() => onFinished()}
                    />
                    : <div style={{ display: 'flex', minHeight: '0' }}>
                        <ProfilePicker
                            action={`make second parent of ${profile.name}`}
                            profiles={state.profiles}
                            onSelectExisting={(profile) => {
                                makeParents(firstParent, {
                                    newlyCreated: false,
                                    profile
                                })
                                onFinished()
                            }}
                            onCreateNew={(profile) => {
                                makeParents(firstParent, {
                                    newlyCreated: true,
                                    profile
                                })
                                onFinished()
                            }}
                            onCancel={() => onFinished()}
                        />
                    </div>
                }
            </div>
        </ModalDialog>
    )
}

export default AddParentsOverlay
