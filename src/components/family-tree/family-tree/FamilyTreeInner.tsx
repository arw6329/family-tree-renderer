import { useContext } from "react"
import "./FamilyTreeInner.scoped.css"
import FamilyTreeRenderer from "../family-tree-renderer/FamilyTreeRenderer"
import { FamilyTreeStateContext } from "../FamilyTreeState"
import ActionButton from "@/components/building-blocks/action-button/ActionButton"
import Flex from "@/components/building-blocks/flex/Flex"

const FamilyTreeInner: React.FC<{
    onAddNewPerson: () => void
    onImportGedcom: () => void
}> = ({onAddNewPerson, onImportGedcom}) => {
    const state = useContext(FamilyTreeStateContext)

    return state.isEmpty() ? <FamilyTreeRenderer /> : <>
        <div className="empty-root">
            <div className="empty">
                <span className="title">This family tree is empty</span>
                <span className="details">Add at least one person to get started</span>
                <Flex gap={6}>
                    <ActionButton onClick={onAddNewPerson}>
                        <span>Add new person</span>
                    </ActionButton>
                    <ActionButton onClick={onImportGedcom}>
                        <span>Import GEDCOM</span>
                    </ActionButton>
                </Flex>
            </div>
        </div>
    </>
}

export default FamilyTreeInner
