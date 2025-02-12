import { DatabaseBuilder } from "@/lib/family-tree/DatabaseBuilder";
import { FamilyTreeDatabase, Profile, SpousalRelationship } from "@/lib/family-tree/FamilyTreeDatabase";
import { ProfileNode } from "@/lib/family-tree/ProfileNode";
import { TreeBuilder } from "@/lib/family-tree/TreeBuilder";
import React, { createContext, JSX, ReactNode, useEffect, useMemo, useState } from "react";

// TODO: bring common db exploration funcs like finding child relationships, spouses, etc.
// for particular node into functions, import here and other places where these operations
// are duplicated, like AbstractFamilyTreeNode and TreeBuilder 

// TODO: remove commas for interfaces
interface ContextType {
    rootNode: ProfileNode,
    setRootProfile: (profile: Profile) => void,
    focusedProfileNode: ProfileNode | null,
    setFocusedProfileNode: (node: ProfileNode | null) => void,
    editing: boolean,
    setEditing: (editing: boolean) => void,
    profiles: Profile[],
    getProfile: (profileId: string) => Profile | null,
    getSpousesOf: (profile: Profile) => { spouse: Profile, relationship: SpousalRelationship }[],
    getRelationshipBetween: (profile1: Profile, profile2: Profile) => SpousalRelationship | null,
    hasParents: (profile: Profile) => boolean,
    addNewProfile: (profile: Profile) => void,
    makeSpouses: (profile1: Profile, profile2: Profile) => SpousalRelationship,
    makeChild: (parentRelationship: SpousalRelationship, profile: Profile) => void,
    disconnectChild: (child: Profile) => void,
    disconnectSpouses: (relationship: SpousalRelationship) => void
}

const FamilyTreeStateContext = createContext<ContextType>(
    new Proxy({} as ContextType, {
        get(target, name) {
            throw new Error('FamilyTreeStateContext had no provider')
        }
    })
)

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
    }, [rootProfile, databaseVersion, editing])

    useMemo(() => {
        // TODO: builder is reran when entering/exiting edit mode, but it should be easy to not do this
        // by just removing all the button nodes instead.
        // Improve efficiency, or does it not matter enough?
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
            getProfile(profileId: string) {
                return database.profiles[profileId]
            },
            getSpousesOf(profile: Profile) {
                const spouses = []
                for(const relationshipId in database.spousal_relationships) {
                    const relationship = database.spousal_relationships[relationshipId]
                    if(relationship.spouse_1_profile_id === profile.profile_id) {
                        spouses.push({
                            spouse: database.profiles[relationship.spouse_2_profile_id],
                            relationship: relationship
                        })
                    } else if(relationship.spouse_2_profile_id === profile.profile_id) {
                        spouses.push({
                            spouse: database.profiles[relationship.spouse_1_profile_id],
                            relationship: relationship
                        })
                    }
                }
                return spouses
            },
            getRelationshipBetween(profile1: Profile, profile2: Profile) {
                const relationship = Object.values(database.spousal_relationships)
                    .find(relationship =>
                        (relationship.spouse_1_profile_id === profile1.profile_id
                            && relationship.spouse_2_profile_id === profile2.profile_id)
                        || (relationship.spouse_2_profile_id === profile1.profile_id
                            && relationship.spouse_1_profile_id === profile2.profile_id)
                    )

                return relationship ?? null
            },
            hasParents(profile: Profile) {
                const childRelationship = Object.values(database.child_relationships)
                    .find(relationship => relationship.child_profile_id === profile.profile_id)
                
                return childRelationship !== null
            },
            addNewProfile(profile: Profile) {
                DatabaseBuilder.fromExisting(database).addNewProfile(profile)
                setDatabaseVersion(Math.random())
            },
            makeSpouses(profile1: Profile, profile2: Profile) {
                const relationship = DatabaseBuilder.fromExisting(database).makeSpouses(profile1, profile2)
                setDatabaseVersion(Math.random())
                return relationship
            },
            makeChild(parentRelationship: SpousalRelationship, profile: Profile) {
                DatabaseBuilder.fromExisting(database).makeChild(parentRelationship, profile)
                setDatabaseVersion(Math.random())
            },
            disconnectChild(child: Profile) {
                const childRelationship = Object.values(database.child_relationships)
                    .find(relationship => relationship.child_profile_id === child.profile_id)

                if(!childRelationship) {
                    throw new Error(`Profile ${child} was not a child of anything`)
                }

                delete database.child_relationships[childRelationship.relationship_id]

                setDatabaseVersion(Math.random())
            },
            disconnectSpouses(relationship: SpousalRelationship) {
                const childRelationships = Object.values(database.child_relationships)
                    .filter(childRelationship => childRelationship.parent_relationship_id === relationship.relationship_id)

                childRelationships.forEach(childRelationship => {
                    delete database.child_relationships[childRelationship.relationship_id]
                })

                delete database.spousal_relationships[relationship.relationship_id]

                setDatabaseVersion(Math.random())
            }
        }}>
            {children}
        </FamilyTreeStateContext.Provider>
    )
}

export { FamilyTreeStateContext, FamilyTreeStateProvider }
