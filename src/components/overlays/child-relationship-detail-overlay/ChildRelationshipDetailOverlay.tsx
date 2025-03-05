import ModalDialog from "../../building-blocks/modal-dialog/ModalDialog"
import { ChildRelationship } from "@/lib/family-tree/FamilyTreeDatabase"
import { useContext, useState } from "react"
import { FamilyTreeStateContext } from "../../family-tree/FamilyTreeState"
import ComplexDateInput from "@/components/building-blocks/complex-date-input/ComplexDateInput"
import ActionButton from "@/components/building-blocks/action-button/ActionButton"
import { getEventDate, getPedigree } from "@/lib/family-tree/metadata-helpers"
import Flex from "@/components/building-blocks/flex/Flex"
import Grid from "@/components/building-blocks/grid/Grid"

const ChildRelationshipDetailOverlay: React.FC<{ relationship: ChildRelationship, onFinished: () => void }> = ({ relationship, onFinished }) => {
    const state = useContext(FamilyTreeStateContext)
    const parentsSpousalRelationship = state.getObjectById('SpousalRelationship', relationship.parent_relationship_id)!
    const parent1 = state.getObjectById('Profile', parentsSpousalRelationship.spouse_1_profile_id)!
    const parent2 = state.getObjectById('Profile', parentsSpousalRelationship.spouse_2_profile_id)!
    const child = state.getObjectById('Profile', relationship.child_profile_id)!
    const [dateOfAdoption, setDateOfAdoption] = useState(getEventDate('ADOPTION', relationship.metadata))
    const initialPedigree = getPedigree(relationship.metadata)
    const [pedigree, setPedigree] = useState(initialPedigree)

    return (
        <ModalDialog onClose={onFinished}>
            {state.editing && <>
                <div style={styles.root}>
                    <span>Relationship between {parent1.name}, {parent2.name}, and {child.name}</span>
                    <Grid gap={20} columns="repeat(auto-fit, 250px)" justifyContent="space-evenly">
                        <Flex column={true} gap={5}>
                            <label>Pedigree</label>
                            <select
                                defaultValue={initialPedigree ?? 'unknown'}
                                onChange={(event) => {
                                    if(event.target.value === 'unknown') {
                                        setPedigree(null)
                                    } else {
                                        setPedigree(event.target.value)
                                    }
                                }}
                            >
                                <option value="biological">Biological</option>
                                <option value="adoptive">Adoptive</option>
                                <option value="foster">Foster</option>
                                <option value="unknown">Unknown</option>
                            </select>
                        </Flex>
                        <Flex column={true} gap={5}>
                            <label>Date of adoption</label>
                            <ComplexDateInput type="moment" defaultValue={dateOfAdoption} onChange={(date) => setDateOfAdoption(date)} />
                        </Flex>
                    </Grid>
                    <Flex gap={6}>
                        <ActionButton onClick={() => {
                            const newRelationship: ChildRelationship = {
                                relationship_id: relationship.relationship_id,
                                parent_relationship_id: relationship.parent_relationship_id,
                                child_profile_id: relationship.child_profile_id,
                                metadata: relationship.metadata
                            }
                            state.replaceObject('ChildRelationship', newRelationship)
                            onFinished()
                        }}>
                            <span>Save</span>
                        </ActionButton>
                        <ActionButton onClick={() => onFinished()}>
                            <span>Cancel</span>
                        </ActionButton>
                    </Flex>
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
        boxSizing: 'border-box' as const
    }
}

export default ChildRelationshipDetailOverlay
