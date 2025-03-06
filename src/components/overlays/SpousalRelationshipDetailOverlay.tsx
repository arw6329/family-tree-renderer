import ModalDialog from "../building-blocks/modal-dialog/ModalDialog"
import { SpousalRelationship } from "@/lib/family-tree/FamilyTreeDatabase"
import { useContext, useState } from "react"
import { FamilyTreeStateContext } from "../family-tree/FamilyTreeState"
import ComplexDateInput from "@/components/building-blocks/complex-date-input/ComplexDateInput"
import ActionButton from "@/components/building-blocks/action-button/ActionButton"
import { getEventDate, getFirstRecord, getPedigree, setEventDate, setPedigree as setPedigreeOfMetadata } from "@/lib/family-tree/metadata-helpers"
import Flex from "@/components/building-blocks/flex/Flex"
import Grid from "@/components/building-blocks/grid/Grid"

const SpousalRelationshipDetailOverlay: React.FC<{ relationship: SpousalRelationship, onFinished: () => void }> = ({ relationship, onFinished }) => {
    const state = useContext(FamilyTreeStateContext)
    const spouse1 = state.getObjectById('Profile', relationship.spouse_1_profile_id)!
    const spouse2 = state.getObjectById('Profile', relationship.spouse_2_profile_id)!
    const [dateOfMarriage, setDateOfMarriage] = useState(getEventDate('MARRIAGE', relationship.metadata))
    const marriageRecord = getFirstRecord('MARRIAGE', relationship.metadata)
    const [dateOfDivorce, setDateOfDivorce] = useState(marriageRecord ? getEventDate('DIVORCE', marriageRecord.children) : null)
    const initialType = getPedigree(relationship.metadata)
    const [type, setType] = useState(initialType)

    return (
        <ModalDialog onClose={onFinished}>
            {state.editing && <>
                <div style={styles.root}>
                    <span>Relationship between {spouse1.name} and {spouse2.name}</span>
                    <Grid gap={20} columns="repeat(auto-fill, 250px)" justifyContent="space-evenly">
                        <Flex column={true} gap={5}>
                            <label>Relationship type</label>
                            <select
                                style={{ height: 35 }}
                                defaultValue={initialType ?? 'unknown'}
                                onChange={(event) => {
                                    if(event.target.value === 'unknown') {
                                        setType(null)
                                    } else {
                                        setType(event.target.value)
                                    }
                                }}
                            >
                                <option value="married">Married or widowed</option>
                                <option value="divorced">Divorced</option>
                                <option value="never-married">Never married</option>
                                <option value="unknown">Unknown</option>
                            </select>
                        </Flex>
                        <Flex column={true} gap={5}>
                            <label>Marriage date</label>
                            <ComplexDateInput type="moment" defaultValue={dateOfMarriage} onChange={(date) => setDateOfMarriage(date)} />
                        </Flex>
                        <Flex column={true} gap={5}>
                            <label>Divorce date</label>
                            <ComplexDateInput type="moment" defaultValue={dateOfDivorce} onChange={(date) => setDateOfDivorce(date)} />
                        </Flex>
                    </Grid>
                    <Flex gap={6}>
                        <ActionButton onClick={() => {
                            // setPedigreeOfMetadata(relationship.metadata, type)
                            // if(type === 'adoptive') {
                            //     setEventDate('ADOPTION', relationship.metadata, dateOfMarriage)
                            // } else if(type === 'foster') {
                            //     setEventDate('FOSTER', relationship.metadata, dateOfDivorce)
                            // }
                            // state.replaceObject('SpousalRelationship', relationship)
                            // onFinished()
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

export default SpousalRelationshipDetailOverlay
