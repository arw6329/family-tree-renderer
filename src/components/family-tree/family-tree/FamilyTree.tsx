import { FamilyTreeDatabase } from "@/lib/family-tree/FamilyTreeDatabase"
import { FamilyTreeStateProvider } from "../FamilyTreeState"
import React, { useState } from "react"
import CreateProfileOverlay from "@/components/overlays/CreateProfileOverlay"
import ImportGedcomOverlay from "@/components/overlays/ImportGedcomOverlay"
import FamilyTreeInner from "./FamilyTreeInner"

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
    const [createFirstProfilePopupActive, setCreateFirstProfilePopupActive] = useState(false)
    const [importGedcomOverlayActive, setImportGedcomOverlayActive] = useState(false)

    return (
        <FamilyTreeStateProvider initialDatabase={database} onDatabaseChange={onDatabaseChange}>
            <FamilyTreeInner
                onAddNewPerson={() => setCreateFirstProfilePopupActive(true)}
                onImportGedcom={() => setImportGedcomOverlayActive(true)}
            />
            {createFirstProfilePopupActive && <CreateProfileOverlay onFinished={() => setCreateFirstProfilePopupActive(false)}/>}
            {importGedcomOverlayActive && <ImportGedcomOverlay onFinished={() => setImportGedcomOverlayActive(false)}/>}
        </FamilyTreeStateProvider>
    )
}

export default FamilyTree