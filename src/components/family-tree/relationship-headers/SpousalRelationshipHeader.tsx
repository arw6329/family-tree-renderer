import HeaderButton from "@/components/building-blocks/header-button/HeaderButton"
import "./RelationshipHeader.scoped.css"
import { useContext, useReducer, useState } from "react"
import { FamilyTreeStateContext } from "../FamilyTreeState"
import AddChildOverlay from "@/components/overlays/AddChildOverlay"
import DismissableBlock from "@/components/building-blocks/dismissable-block/DismissableBlock"
import ViewMetadataOverlay from "@/components/overlays/ViewMetadataOverlay"
import LabeledElement from "@/components/building-blocks/labeled-text/LabeledText"
import Grid from "@/components/building-blocks/grid/Grid"
import { blankRecord, getEventDate, getFirstRecord, getSpousalRelationshipType, setEventDate, SpousalRelationshipType } from "@/lib/family-tree/metadata-helpers"
import { prettyDate } from "@/lib/family-tree/date-utils"
import { NodeMetadata, SpousalRelationship } from "@/lib/family-tree/FamilyTreeDatabase"
import EditMetadataOverlay from "@/components/overlays/EditMetadataOverlay"
import ComplexDateInput from "@/components/building-blocks/complex-date-input/ComplexDateInput"
import { ComplexDate } from "@/lib/family-tree/ComplexDate"

const SimpleMetadataRow: React.FC<{ metadata: NodeMetadata[] }> = ({ metadata }) => {
    const type = getSpousalRelationshipType(metadata)
    const marriageDate = getEventDate('MARRIAGE', metadata)
    const marriageRecord = getFirstRecord('MARRIAGE', metadata)
    const divorceDate = marriageRecord ? getEventDate('DIVORCE', marriageRecord.children) : null
    return <Grid gap={15} columns="repeat(auto-fill, 150px)" justifyContent="space-evenly" style={{ flexGrow: 1 }}>
        {type && <LabeledElement label="Relationship type" text={{
            'married': 'Married',
            'divorced': 'Divorced',
            'never-married': 'Never married'
        }[type]} />}
        {marriageDate && <LabeledElement label="Marriage date" text={prettyDate(marriageDate)} />}
        {divorceDate  && <LabeledElement label="Divorce date"  text={prettyDate(divorceDate)} />}
    </Grid>
}

const EditableSimpleMetadataRow: React.FC<{
    metadata: NodeMetadata[],
    onMetadataChange: (metadata: NodeMetadata[]) => void
}> = (props) => {
    const [state, editState] = useReducer((_state, action: {
        action: 'set_type',
        type: SpousalRelationshipType | null
    } | {
        action: 'set_marriage_date' | 'set_divorce_date',
        date: ComplexDate | null
    }) => {
        const currentState = structuredClone(_state)
        let newState: NodeMetadata[]
        switch(action.action) {
            case 'set_type': {
                switch(action.type) {
                    case 'divorced': {
                        const marriageRecord = getFirstRecord('MARRIAGE', currentState) ?? blankRecord('MARRIAGE')
                        marriageRecord.children.push(blankRecord('DIVORCE'))
                        newState = [marriageRecord]
                        break
                    }
                    case 'married': {
                        const marriageDate = getEventDate('MARRIAGE', currentState)
                        newState = [{
                            type: 'simple' as const,
                            key: 'MARRIAGE',
                            value: null,
                            children: marriageDate ? [{
                                type: 'simple' as const,
                                key: 'DATE',
                                value: marriageDate,
                                children: []
                            }] : []
                        }]
                        break
                    }
                    case 'never-married': {
                        throw new Error('Not implemented')
                    }
                    case null: {
                        newState = []
                        break
                    }
                }
                break
            }
            case 'set_marriage_date': {
                setEventDate('MARRIAGE', currentState, action.date)
                newState = currentState
                break
            }
            case 'set_divorce_date': {
                const marriageRecord = getFirstRecord('MARRIAGE', currentState) ?? blankRecord('MARRIAGE')
                setEventDate('DIVORCE', marriageRecord.children, action.date)
                newState = [marriageRecord]
                break
            }
        }
        props.onMetadataChange(newState)
        return newState
    }, structuredClone(props.metadata))

    const initialType = getSpousalRelationshipType(props.metadata)
    const initialMarriageDate = getEventDate('MARRIAGE', props.metadata)
    const initialMarriageRecord = getFirstRecord('MARRIAGE', props.metadata)
    const initialDivorceDate = initialMarriageRecord ? getEventDate('DIVORCE', initialMarriageRecord.children) : null
    const type = getSpousalRelationshipType(state)

    return <Grid gap={15} columns="repeat(auto-fill, 230px)" justifyContent="space-evenly">
        <LabeledElement label="Relationship type">
            <select
                style={{ height: 35 }}
                defaultValue={initialType ?? 'unknown'}
                onChange={(event) => {
                    if(event.target.value === 'unknown') {
                        editState({
                            action: 'set_type',
                            type: null
                        })
                    } else {
                        editState({
                            action: 'set_type',
                            type: event.target.value
                        })
                    }
                }}
            >
                <option value="married">Married or widowed</option>
                <option value="divorced">Divorced</option>
                <option value="never-married">Never married</option>
                <option value="unknown">Unknown</option>
            </select>
        </LabeledElement>
        {(type === 'married' || type === 'divorced') && <LabeledElement label="Marriage date">
            <ComplexDateInput type="moment" defaultValue={initialMarriageDate} onChange={(date) => editState({
                action: 'set_marriage_date',
                date: date
            })} />
        </LabeledElement>}
        {type === 'divorced' && <LabeledElement label="Divorce date">
            <ComplexDateInput type="moment" defaultValue={initialDivorceDate} onChange={(date) => editState({
                action: 'set_divorce_date',
                date: date
            })} />
        </LabeledElement>}
    </Grid>
}

const SpousalRelationshipHeader: React.FC<{  }> = ({  }) => {
    const state = useContext(FamilyTreeStateContext)
    const [addChildOverlayActive, setAddChildOverlayActive] = useState(false)
    const [moreDetailsPopupActive, setMoreDetailsPopupActive] = useState(false)

    const relationship = state.getObjectById('SpousalRelationship', state.focusedSpousalRelationshipId!)!
    const spouse1 = state.getObjectById('Profile', relationship.spouse_1_profile_id)!
    const spouse2 = state.getObjectById('Profile', relationship.spouse_2_profile_id)!

    return (
        <header>
            <DismissableBlock closeButtonTitle="Close relationship details" onDismiss={() => state.setFocusedObjectId('SpousalRelationship', null)}>
                <div className="row" style={{ minHeight: 80 }}>
                    <span className="name">Relationship between<br />{spouse1.name} and {spouse2.name}</span>
                    <SimpleMetadataRow metadata={relationship.metadata} />
                </div>
            </DismissableBlock>
            <div className="row">
                {state.editing && <>
                    <HeaderButton onClick={() => {
                        state.disconnectSpouses(relationship)
                        state.setFocusedObjectId('SpousalRelationship', null)
                    }}>
                        <span>Break relationship</span>
                    </HeaderButton>
                    <HeaderButton onClick={() => setMoreDetailsPopupActive(true)}>
                        <span>Edit details</span>
                    </HeaderButton>
                    <HeaderButton onClick={() => setAddChildOverlayActive(true)}>
                        <span>Add child</span>
                    </HeaderButton>
                </>}
            </div>

            {addChildOverlayActive && <>
                <AddChildOverlay
                    parentRelationship={relationship}
                    onFinished={() => setAddChildOverlayActive(false)}
                />
            </>}

            {moreDetailsPopupActive && !state.editing && <>
                <ViewMetadataOverlay
                    metadata={relationship.metadata}
                    onFinished={() => setMoreDetailsPopupActive(false)}
                    title={<span>Relationship between {spouse1.name} and {spouse2.name}</span>}
                    simpleSchema={{
                        MARRIAGE: {
                            DATE: {},
                            DIVORCE: {
                                DATE: {}
                            }
                        }
                    }}
                    simpleRepresentation={(metadata) => <SimpleMetadataRow metadata={metadata} />}
                />                    
            </>}

            {moreDetailsPopupActive && state.editing && <>
                <EditMetadataOverlay
                    minWidth={780}
                    metadata={relationship.metadata}
                    onEditMetadata={(metadata) => {
                        const newRelationship: SpousalRelationship = {
                            relationship_id: relationship.relationship_id,
                            spouse_1_profile_id: relationship.spouse_1_profile_id,
                            spouse_2_profile_id: relationship.spouse_2_profile_id,
                            metadata: metadata
                        }
                        state.replaceObject('SpousalRelationship', newRelationship)
                    }}
                    onFinished={() => setMoreDetailsPopupActive(false)}
                    title={<span>Relationship between {spouse1.name} and {spouse2.name}</span>}
                    simpleSchema={{
                        MARRIAGE: {
                            DATE: {},
                            DIVORCE: {
                                DATE: {}
                            }
                        }
                    }}
                    simpleRepresentation={(metadata, onMetadataChange) => <EditableSimpleMetadataRow metadata={metadata} onMetadataChange={onMetadataChange} />}
                />                    
            </>}
        </header>
    )
}

export default SpousalRelationshipHeader
