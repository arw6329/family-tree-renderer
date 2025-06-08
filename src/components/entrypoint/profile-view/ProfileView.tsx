import _ProfileView from "@/components/profile-view/ProfileView"
import { useEffect, useRef } from "react"
import { ensureDefined, ShadowBoundary, ShadowBoundaryElement } from "../ShadowBoundary"
import type { FamilyTreeDatabase } from "@/lib/family-tree/FamilyTreeDatabase"
import { DatabaseView } from "@/lib/family-tree/DatabaseView"

const ProfileView: React.FC<{
    profileId: string
    database: FamilyTreeDatabase
}> = ({ profileId, database }) => {
    const rootElem = useRef<ShadowBoundaryElement>(null)
    
    useEffect(() => {
        ensureDefined()
        rootElem.current!.render(<_ProfileView profileId={profileId} database={DatabaseView.fromExisting(database)} />)
    })

    return (
        <div style={{ height: '100%' }}>
            <ShadowBoundary ref={rootElem} />
        </div>
    )
}

export default ProfileView
