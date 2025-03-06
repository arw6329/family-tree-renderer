import HeaderButton from "@/components/building-blocks/header-button/HeaderButton"
import "./RelationshipHeader.scoped.css"
import { useContext, useState } from "react"
import { FamilyTreeStateContext } from "../FamilyTreeState"
import DismissableBlock from "@/components/building-blocks/dismissable-block/DismissableBlock"
import ChildRelationshipDetailOverlay from "@/components/overlays/child-relationship-detail-overlay/ChildRelationshipDetailOverlay"
import { getEventDate, getPedigree } from "@/lib/family-tree/metadata-helpers"
import { prettyDate } from "@/lib/family-tree/date-utils"

const ChildRelationshipHeader: React.FC<{  }> = ({  }) => {
    const state = useContext(FamilyTreeStateContext)
    const relationship = state.getObjectById('ChildRelationship', state.focusedChildRelationshipId!)!
    const child = state.getObjectById('Profile', relationship.child_profile_id)!
    const [moreDetailsPopupActive, setMoreDetailsPopupActive] = useState(false)
    const pedigree = getPedigree(relationship.metadata)
    const dateOfAdoption = getEventDate('ADOPTION', relationship.metadata)
    const dateOfFoster = getEventDate('FOSTER', relationship.metadata)

    return (
        <header>
            <DismissableBlock closeButtonTitle="Close relationship details" onDismiss={() => state.setFocusedObjectId('ChildRelationship', null)}>
                <div className="row" style={{ minHeight: 80 }}>
                    <span className="name">Relationship between {child.name} and parents</span>
                    <div className="metadata-row">
                        {pedigree && <div className="metadata">
                            <label>Pedigree</label>
                            <span>{
                                {
                                    'adoptive': 'Adoptive',
                                    'biological': 'Biological',
                                    'foster': 'Foster'
                                }[pedigree]
                            }</span>
                        </div>}
                        {dateOfAdoption && <div className="metadata">
                            <label>Adoption date</label>
                            <span>{prettyDate(dateOfAdoption)}</span>
                        </div>}
                        {dateOfFoster && <div className="metadata">
                            <label>Foster date</label>
                            <span>{prettyDate(dateOfFoster)}</span>
                        </div>}
                    </div>
                </div>
            </DismissableBlock>
            <div className="row">
                {state.editing && <>
                    <HeaderButton onClick={() => {
                        state.disconnectChild(child)
                        state.setFocusedObjectId('ChildRelationship', null)
                    }}>
                        <span>Break relationship</span>
                    </HeaderButton>
                    <HeaderButton onClick={() => setMoreDetailsPopupActive(true)}>
                        <span>Edit details</span>
                    </HeaderButton>
                </>}
            </div>

            {moreDetailsPopupActive && <>
                <ChildRelationshipDetailOverlay
                    relationship={relationship}
                    onFinished={() => setMoreDetailsPopupActive(false)}
                />
            </>}
        </header>
    )
}

export default ChildRelationshipHeader
