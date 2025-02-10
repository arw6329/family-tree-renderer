import { FamilyTreeDatabase, Profile } from "@/lib/family-tree/FamilyTreeDatabase";
import { ProfileNode } from "@/lib/family-tree/ProfileNode";
import { TreeBuilder } from "@/lib/family-tree/TreeBuilder";
import React, { createContext, JSX, ReactNode, useEffect, useMemo, useState } from "react";

function throwNoProvider() {
    throw new Error('FamilyTreeStateContext had no provider')
}

const FamilyTreeStateContext = createContext<{
    rootNode: ProfileNode,
    setRootNode: (node: ProfileNode) => void,
    focusedProfileNode: ProfileNode | null,
    setFocusedProfileNode: (node: ProfileNode) => void
}>({
    get rootNode(): ProfileNode {
        throw throwNoProvider()
    },
    setRootNode: throwNoProvider,
    focusedProfileNode: null,
    setFocusedProfileNode: throwNoProvider
})

const FamilyTreeStateProvider: React.FC<{ database: FamilyTreeDatabase, children: ReactNode }> = ({ database, children }) => {
    const rootProfile = Object.values(database.profiles)[0]
    const [rootNode, setRootNode] = useState<ProfileNode>(
        ProfileNode.create_unconnected_node({
            profile: rootProfile
        })
    )
    const [focusedProfileNode, setFocusedProfileNode] = useState<ProfileNode | null>(null)

    useMemo(() => {
        const builder = new TreeBuilder(database)
        builder.construct_tree(rootNode)
    }, [database, rootNode])

    return (
        <FamilyTreeStateContext.Provider value={{
            rootNode,
            setRootNode,
            focusedProfileNode,
            setFocusedProfileNode
        }}>
            {children}
        </FamilyTreeStateContext.Provider>
    )
}

export { FamilyTreeStateContext, FamilyTreeStateProvider }
