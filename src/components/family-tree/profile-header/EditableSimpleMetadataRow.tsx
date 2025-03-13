import ComplexDateInput from "@/components/building-blocks/complex-date-input/ComplexDateInput"
import Grid from "@/components/building-blocks/grid/Grid"
import LabeledElement from "@/components/building-blocks/labeled-text/LabeledText"
import { ComplexDate } from "@/lib/family-tree/ComplexDate"
import { NodeMetadata } from "@/lib/family-tree/FamilyTreeDatabase"
import { getEventDate, setEventDate } from "@/lib/family-tree/metadata-helpers"
import { useReducer } from "react"

const EditableSimpleMetadataRow: React.FC<{
    metadata: NodeMetadata[],
    onMetadataChange: (metadata: NodeMetadata[]) => void
}> = (props) => {
    const [state, editState] = useReducer((_state, action: {
        action: 'set_birth_date' | 'set_death_date',
        date: ComplexDate | null
    }) => {
        const currentState = structuredClone(_state)
        let newState: NodeMetadata[]
        switch(action.action) {
            case 'set_birth_date': {
                setEventDate('BIRTH', currentState, action.date)
                newState = currentState
                break
            }
            case 'set_death_date': {
                setEventDate('DEATH', currentState, action.date)
                newState = currentState
                break
            }
        }
        props.onMetadataChange(newState)
        return newState
    }, structuredClone(props.metadata))

    const initialBirthDate = getEventDate('BIRTH', props.metadata)
    const initialDeathDate = getEventDate('DEATH', props.metadata)

    return <Grid gap={15} columns="repeat(auto-fill, 230px)" justifyContent="space-evenly">
        <LabeledElement label="Date of birth">
            <ComplexDateInput type="moment" defaultValue={initialBirthDate} onChange={(date) => editState({
                action: 'set_birth_date',
                date: date
            })} />
        </LabeledElement>
        <LabeledElement label="Date of death">
            <ComplexDateInput type="moment" defaultValue={initialDeathDate} onChange={(date) => editState({
                action: 'set_death_date',
                date: date
            })} />
        </LabeledElement>
    </Grid>
}

export default EditableSimpleMetadataRow
