import { useEffect, useRef } from "react"
import { FamilyTreeDatabase } from "@/lib/family-tree/FamilyTreeDatabase"
import _FamilyTree from "../family-tree/family-tree/FamilyTree"
import { ensureDefined, ShadowBoundary, ShadowBoundaryElement } from "./ShadowBoundary"

const FamilyTree: React.FC<{
    database?: FamilyTreeDatabase
    onDatabaseChange?: (database: FamilyTreeDatabase) => Promise<unknown>
}> = ({ database, onDatabaseChange }) => {
    const rootElem = useRef<ShadowBoundaryElement>(null)

    useEffect(() => {
        ensureDefined()
        rootElem.current!.render(<_FamilyTree
            database={database}
            onDatabaseChange={onDatabaseChange}
        />)
    })

    return (
        <div style={{ height: '100%' }}>
            <ShadowBoundary ref={rootElem} />
        </div>
    )
}

export default FamilyTree
