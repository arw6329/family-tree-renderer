import { FamilyTreeDatabase } from "@/lib/family-tree/FamilyTreeDatabase"
import { FamilyTreeStateProvider } from "../FamilyTreeState"
import React, { useState } from "react"
import CreateProfileOverlay from "@/components/overlays/CreateProfileOverlay"
import ImportGedcomOverlay from "@/components/overlays/ImportGedcomOverlay"
import FamilyTreeInner from "./FamilyTreeInner"
import { ErrorBoundary } from "react-error-boundary"
import FamilyTreeError from "../family-tree-error/FamilyTreeError"
import "@/global.css"

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
        <ErrorBoundary FallbackComponent={FamilyTreeError}>
            <FamilyTreeStateProvider initialDatabase={database} onDatabaseChange={onDatabaseChange}>
                <FamilyTreeInner
                    onAddNewPerson={() => setCreateFirstProfilePopupActive(true)}
                    onImportGedcom={() => setImportGedcomOverlayActive(true)}
                />
                {createFirstProfilePopupActive && <CreateProfileOverlay onFinished={() => setCreateFirstProfilePopupActive(false)}/>}
                {importGedcomOverlayActive && <ImportGedcomOverlay onFinished={() => setImportGedcomOverlayActive(false)}/>}
            </FamilyTreeStateProvider>
        </ErrorBoundary>
    )
}

export default FamilyTree