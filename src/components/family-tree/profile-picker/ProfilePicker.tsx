import { Profile } from "@/lib/family-tree/FamilyTreeDatabase"
import "./ProfilePicker.scoped.css"
import { useContext, useState } from "react"
import ActionButton from "@/components/building-blocks/action-button/ActionButton"
import { FamilyTreeStateContext } from "../FamilyTreeState"

interface ProfilePickerProps {
    action: string
    profiles: Profile[]
    validModes?: 'create' | 'select'
    onSelectExisting?: (profile: Profile) => void
    onCreateNew?: (profile: Profile) => void
    onCancel?: () => void
}

const ProfilePicker: React.FC<ProfilePickerProps> = ({ action, profiles, validModes, onSelectExisting, onCreateNew, onCancel }) => {
    const state = useContext(FamilyTreeStateContext)
    const [selected, setSelected] = useState<Profile | null>(null)
    const [input, setInput] = useState('')
    const [mode, setMode] = useState<'create' | 'select'>(validModes !== 'create' ? 'select' : 'create')

    function switchToMode(mode: 'create' | 'select') {
        setMode(mode)
        setSelected(null)
    }

    const suggestionRegex = new RegExp(
        input.toLowerCase().trim()
            .split(/(?:\s+|\b)/)
            .map(piece => piece.split('')
                .map(char => `\\u${char.codePointAt(0)!.toString(16).padStart(4, '0')}`)
                .join('')
            )
            .join('.*')
    )

    const suggestedProfiles = profiles
        .filter(profile => profile.name.toLowerCase().match(suggestionRegex))
        .slice(0, 100) // Show max 100 profiles to avoid lag

    return (
        <div className="root">
            <span>{mode === 'create' ? 'Create' : 'Select'} a person to {action}</span>
            {validModes === undefined && <>
                <select onChange={(event) => switchToMode(event.target.value)} value={mode}>
                    <option value="select">Use an existing person</option>
                    <option value="create">Create a new person</option>
                </select>
            </>}
            {
                mode === 'select'
                ? <>
                    <label>Existing profiles</label>
                    <input type="text" placeholder="Filter" onInput={(event) => setInput(event.target.value)} />
                    {
                        suggestedProfiles.length > 0
                        ? <>
                            <div className="profiles">
                                {suggestedProfiles.map(profile => (
                                    <button
                                        className="profile"
                                        data-selected={selected?.profile_id === profile.profile_id}
                                        onClick={() => setSelected(profile)}
                                        key={'profile-picker-suggestion--' + profile.profile_id}
                                    >
                                        <img className="profile-pic" loading="lazy" src={state.getProfilePictureURL(profile)} />
                                        <span>{profile.name}</span>
                                    </button>
                                ))}
                            </div>
                        </> : <>
                            <div>
                                <span>No profiles found. {validModes !== 'select' &&
                                    <a
                                        href="javascript:void(0)"
                                        onClick={() => switchToMode('create')}
                                    >
                                        Create new profile for "{input}" instead
                                    </a>
                                }</span>
                            </div>
                        </>
                    }
                </> : <>
                    <label>Create new profile</label>
                    <input type="text" placeholder="Name" onInput={(event) => setInput(event.target.value)} />
                </>
            }
            <div style={{ display: 'flex', gap: 6 }}>
                {
                    mode === 'select'
                    ? <ActionButton disabled={selected === null} onClick={() => onSelectExisting?.(selected!)}>
                        <span>{selected ? `Use ${selected.name}` : validModes === 'select' ? 'Select a profile first' : 'Select or create a profile first'}</span>
                    </ActionButton>
                    : <ActionButton disabled={input === ''} onClick={() => {
                        onCreateNew?.({
                            profile_id: crypto.randomUUID(),
                            name: input,
                            family_tree_gender: 'NEUTRAL',
                            metadata: []
                        })
                    }}>
                        <span>{input ? `Use ${input}` : 'Enter a name first'}</span>
                    </ActionButton>
                }
                <ActionButton onClick={() => onCancel?.()}>
                    <span>Cancel</span>
                </ActionButton>
            </div>
        </div>
    )
}

export default ProfilePicker
