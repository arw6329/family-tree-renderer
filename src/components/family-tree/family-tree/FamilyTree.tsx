import { FamilyTreeDatabase } from "@/lib/family-tree/FamilyTreeDatabase"
import { FamilyTreeStateProvider } from "../FamilyTreeState"
import FamilyTreeRenderer from "../family-tree-renderer/FamilyTreeRenderer"
import "./FamilyTree.scoped.css"
import ActionButton from "@/components/building-blocks/action-button/ActionButton"
import { useState } from "react"
import CreateProfileOverlay from "@/components/overlays/CreateProfileOverlay"

const blankDatabase: FamilyTreeDatabase = {
    root_metadata: {},
    profiles: {},
    spousal_relationships: {},
    child_relationships: {}
}

const FamilyTree: React.FC<{
    database?: FamilyTreeDatabase
    onDatabaseChange?: (database: FamilyTreeDatabase) => Promise<unknown>
}> = ({ database = blankDatabase, onDatabaseChange }) => {
    const nonEmpty = Object.keys(database.profiles).length > 0
    const [createFirstProfilePopupActive, setCreateFirstProfilePopupActive] = useState(false)

    return (
        <FamilyTreeStateProvider database={database} onDatabaseChange={onDatabaseChange}>
            {nonEmpty ? <FamilyTreeRenderer /> : <>
                <div className="empty-root">
                    <div className="empty">
                        <span className="title">This family tree is empty</span>
                        <span className="details">Add at least one person to get started</span>
                        <ActionButton onClick={() => setCreateFirstProfilePopupActive(true)}>
                            <span>Add new person</span>
                        </ActionButton>
                    </div>
                </div>
            </>}
            {createFirstProfilePopupActive && <CreateProfileOverlay onFinished={() => setCreateFirstProfilePopupActive(false)}/>}
        </FamilyTreeStateProvider>
    )
}

export default FamilyTree