import ModalDialog from "../../modal-dialog/ModalDialog"
import MetadataFrame from "../../metadata-frame/MetadataFrame"
import { Profile } from "@/lib/family-tree/FamilyTreeDatabase"
import { IconContext } from "react-icons"
import { FaMars, FaVenus } from "react-icons/fa6"
import { useContext, useState } from "react"
import { FamilyTreeStateContext } from "../../family-tree/FamilyTreeState"
import "./ProfileDetailOverlay.scoped.css"
import ComplexDateInput from "@/components/complex-date-input/ComplexDateInput"
import ActionButton from "@/components/action-button/ActionButton"
import { getBirthDate, getDeathDate, setBirthDate, setDeathDate } from "@/lib/family-tree/metadata-helpers"

const ProfileDetailOverlay: React.FC<{ profile: Profile, onFinished: () => void }> = ({ profile, onFinished }) => {
    const state = useContext(FamilyTreeStateContext)
    
    const [name, setName] = useState(profile.name)
    const [gender, setGender] = useState(profile.family_tree_gender)
    const [dateOfBirth, setDateOfBirth] = useState(getBirthDate(profile.metadata))
    const [dateOfDeath, setDateOfDeath] = useState(getDeathDate(profile.metadata))

    return (
        <ModalDialog>
            {state.editing && <>
                <div style={styles.root}>
                    <div style={styles.nameRow}>
                        <img style={styles.profilePic} />
                        <input
                            type="text"
                            placeholder="Name"
                            defaultValue={profile.name}
                            style={styles.name}
                            onChange={(event) => setName(event.target.value)}
                        />
                        <div style={styles.labelAndInput}>
                            <label>Gender</label>
                            <select
                                defaultValue={profile.family_tree_gender}
                                onChange={(event) => setGender(event.target.value as Profile['family_tree_gender'])}
                            >
                                <option value="FEMALE">Female</option>
                                <option value="MALE">Male</option>
                                <option value="NONBINARY">Non-binary</option>
                                <option value="NEUTRAL">Unknown/not specified</option>
                            </select>
                        </div>
                    </div>
                    <div style={styles.row}>
                        <div style={styles.labelAndInput}>
                            <label>Date of birth</label>
                            <ComplexDateInput type="moment" defaultValue={dateOfBirth} onChange={(date) => setDateOfBirth(date)} />
                        </div>
                        <div style={styles.labelAndInput}>
                            <label>Date of death</label>
                            <ComplexDateInput type="moment" defaultValue={dateOfDeath} onChange={(date) => setDateOfDeath(date)} />
                        </div>
                    </div>
                    <div style={styles.buttonRow}>
                        <ActionButton onClick={() => {
                            const newProfile: Profile = {
                                profile_id: profile.profile_id,
                                name: name,
                                family_tree_gender: gender,
                                metadata: setDeathDate(setBirthDate(profile.metadata, dateOfBirth), dateOfDeath)
                            }
                            state.replaceProfile(newProfile)
                            onFinished()
                        }}>
                            <span>Save</span>
                        </ActionButton>
                        <ActionButton onClick={() => onFinished()}>
                            <span>Cancel</span>
                        </ActionButton>
                    </div>
                </div>
            </> || <>
                <div style={styles.root}>
                    <div style={styles.nameRow}>
                        <img style={styles.profilePic} />
                        <span style={styles.name}>{profile.name}</span>
                        {profile.family_tree_gender === 'FEMALE'
                            && <IconContext.Provider value={{ style: { height: 25 } }}>
                                <FaVenus fill="#ffb3c0" />
                            </IconContext.Provider>}
                        {profile.family_tree_gender === 'MALE'
                            && <IconContext.Provider value={{ style: { height: 27, width: 22 } }}>
                                <FaMars fill="cornflowerblue" />
                            </IconContext.Provider>}
                    </div>
                    <MetadataFrame />
                </div>
            </>}
        </ModalDialog>
    )
}

const styles = {
    root: {
        display: 'flex',
        flexDirection: 'column' as const,
        border: '1px solid #495054',
        backgroundColor: '#1c1e1f',
        padding: 16,
        gap: 16,
        minWidth: 600,
        boxSizing: 'border-box' as const
    },

    nameRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 10
    },

    profilePic: {
        width: 50,
        height: 50,
        borderRadius: '100%'
    },

    name: {
        fontSize: '1.4rem',
        color: 'white',
        marginLeft: 10
    },

    row: {
        display: 'flex',
        gap: 20,
        justifyContent: 'space-evenly',
        margin: '15px 0'
    },

    labelAndInput: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 5
    },

    buttonRow: {
        display: 'flex',
        gap: 6
    }
}

export default ProfileDetailOverlay
