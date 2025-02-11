import { DatabaseBuilder } from "@/lib/family-tree/DatabaseBuilder";
import { FamilyTreeDatabase, Profile } from "@/lib/family-tree/FamilyTreeDatabase";
import { ProfileNode } from "@/lib/family-tree/ProfileNode";
import { TreeBuilder } from "@/lib/family-tree/TreeBuilder";
import React, { createContext, JSX, ReactNode, useEffect, useMemo, useState } from "react";

function throwNoProvider() {
    throw new Error('FamilyTreeStateContext had no provider')
}

const FamilyTreeStateContext = createContext<{
    rootNode: ProfileNode,
    setRootProfile: (profile: Profile) => void,
    focusedProfileNode: ProfileNode | null,
    setFocusedProfileNode: (node: ProfileNode | null) => void,
    editing: boolean,
    setEditing: (editing: boolean) => void,
    profiles: Profile[],
    addNewProfile: (profile: Profile) => void,
    makeSpouses: (profile1: Profile, profile2: Profile) => void
}>({
    get rootNode(): ProfileNode {
        throw throwNoProvider()
    },
    setRootProfile: throwNoProvider,
    focusedProfileNode: null,
    setFocusedProfileNode: throwNoProvider,
    editing: false,
    setEditing: throwNoProvider,
    profiles: [],
    addNewProfile: throwNoProvider,
    makeSpouses: throwNoProvider
})

const FamilyTreeStateProvider: React.FC<{ database: FamilyTreeDatabase, children: ReactNode }> = ({ database, children }) => {
    const [rootProfile, setRootProfile] = useState(Object.values(database.profiles)[0])
    const [focusedProfileNode, setFocusedProfileNode] = useState<ProfileNode | null>(null)
    const [editing, setEditing] = useState<boolean>(false)
    // used to force rerender when database changes
    const [databaseVersion, setDatabaseVersion] = useState(Math.random())

    const rootNode = useMemo(() => {
        return ProfileNode.create_unconnected_node({
            profile: rootProfile
        })
    }, [rootProfile, databaseVersion])

    useMemo(() => {
        const builder = new TreeBuilder(database)
        builder.construct_tree(rootNode)
        if(editing) {
            builder.enter_edit_mode()
        }
    }, [database, rootNode, editing])

    return (
        <FamilyTreeStateContext.Provider value={{
            rootNode,
            setRootProfile,
            focusedProfileNode,
            setFocusedProfileNode,
            editing,
            setEditing,
            profiles: Object.values(database.profiles),
            addNewProfile(profile: Profile) {
                DatabaseBuilder.fromExisting(database).addNewProfile(profile)
                setDatabaseVersion(Math.random())
            },
            makeSpouses(profile1: Profile, profile2: Profile) {
                DatabaseBuilder.fromExisting(database).makeSpouses(profile1, profile2)
                setDatabaseVersion(Math.random())
            }
        }}>
            {children}
        </FamilyTreeStateContext.Provider>
    )
}

export { FamilyTreeStateContext, FamilyTreeStateProvider }
