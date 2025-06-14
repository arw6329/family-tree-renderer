import { useEffect, useRef } from "react"
import { ensureDefined, ShadowBoundary, ShadowBoundaryElement } from "../ShadowBoundary"
import type { FamilyTreeDatabase } from "@/lib/family-tree/FamilyTreeDatabase"
import { DatabaseView } from "@/lib/family-tree/DatabaseView"
import SearchPage from "@/components/search/SearchPage"

const Search: React.FC<{
    database: FamilyTreeDatabase
}> = ({ database }) => {
    const rootElem = useRef<ShadowBoundaryElement>(null)
    
    useEffect(() => {
        ensureDefined()
        rootElem.current!.render(<SearchPage database={DatabaseView.fromExisting(database)} />)
    })

    return (
        <div style={{ height: '100%' }}>
            <ShadowBoundary ref={rootElem} />
        </div>
    )
}

export default Search