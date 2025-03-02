import { AbstractFamilyTreeNode } from "@/lib/family-tree/AbstractFamilyTreeNode";
import { DatabaseBuilder } from "@/lib/family-tree/DatabaseBuilder";
import { FamilyTreeDatabase, ObjectType, ObjectTypeToInterface, Profile, SpousalRelationship } from "@/lib/family-tree/FamilyTreeDatabase";
import { ProfileNode } from "@/lib/family-tree/ProfileNode";
import { TreeBuilder } from "@/lib/family-tree/TreeBuilder";
import React, { createContext, JSX, ReactNode, useEffect, useMemo, useRef, useState } from "react";

// TODO: bring common db exploration funcs like finding child relationships, spouses, etc.
// for particular node into functions, import here and other places where these operations
// are duplicated, like AbstractFamilyTreeNode and TreeBuilder 

// TODO: move all these db exploration/modification funcs into another file

// TODO: remove commas for interfaces
interface ContextType {
    rootNode: ProfileNode,
    setRootProfile: (profile: Profile) => void,
    focusedProfileId: string | null,
    focusedSpousalRelationshipId: string | null,
    focusedChildRelationshipId: string | null,
    setFocusedObjectId: (type: ObjectType, id: string | null) => void,
    editing: boolean,
    setEditing: (editing: boolean) => void,
    profiles: Profile[],
    getNodesBy: (predicate: (node: AbstractFamilyTreeNode) => boolean) => AbstractFamilyTreeNode[],
    getProfile: (profileId: string) => Profile | null, // TODO: replace usages with getObjectById
    getSpousesOf: (profile: Profile) => { spouse: Profile, relationship: SpousalRelationship }[],
    getRelationshipBetween: (profile1: Profile, profile2: Profile) => SpousalRelationship | null,
    getObjectById: <T extends ObjectType>(type: T, id: string) => ObjectTypeToInterface[T] | null,
    hasParents: (profile: Profile) => boolean,
    addNewProfile: (profile: Profile) => void,
    replaceProfile: (profile: Profile) => void,
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

const FamilyTreeStateProvider: React.FC<{ database: FamilyTreeDatabase, onDatabaseChange?: (database: FamilyTreeDatabase) => Promise<unknown>, children: ReactNode }> = ({ database, onDatabaseChange, children }) => {
    const [rootProfile, setRootProfile] = useState<Profile | null>(Object.values(database.profiles)[0])
    const [focusedProfileId, setFocusedProfileId] = useState<string | null>(null)
    const [focusedSpousalRelationshipId, setFocusedSpousalRelationshipId] = useState<string | null>(null)
    const [focusedChildRelationshipId, setFocusedChildRelationshipId] = useState<string | null>(null)
    const [editing, setEditing] = useState<boolean>(false)
    // used to force rerender when database changes
    const [databaseVersion, setDatabaseVersion] = useState(Math.random())
    const databaseVersionRef = useRef(databaseVersion)
    const lastNotifiedDatabaseVersion = useRef(databaseVersion)
    const consumerDatabaseUpdateInProgress = useRef(false)

    function cycleDatabaseVersion() {
        const version = Math.random()
        console.log(`Setting db version to ${version}`)
        setDatabaseVersion(version)
        databaseVersionRef.current = version
    }

    const rootNode: ProfileNode | null = useMemo(() => {
        if(rootProfile) {
            return ProfileNode.create_unconnected_node({
                profile: rootProfile
            })
        } else {
            return null
        }
    }, [rootProfile, databaseVersion, editing])

    const builder = useMemo(() => {
        if(!rootNode) {
            return null
        }

        // TODO: builder is reran when entering/exiting edit mode, but it should be easy to not do this
        // by just removing all the button nodes instead.
        // Improve efficiency, or does it not matter enough?
        const builder = new TreeBuilder(database)
        builder.construct_tree(rootNode)
        if(editing) {
            builder.enter_edit_mode()
        }

        // TODO: debug only
        window.treeBuilder = builder

        return builder
    }, [database, rootNode, editing])

    if(onDatabaseChange && databaseVersion !== lastNotifiedDatabaseVersion.current && !consumerDatabaseUpdateInProgress.current) {
        consumerDatabaseUpdateInProgress.current = true

        function createPromise() {
            console.log(`Sending a consumer db change notification on version ${databaseVersionRef.current}`)
            const promise: Promise<unknown> = onDatabaseChange!(database)
            lastNotifiedDatabaseVersion.current = databaseVersionRef.current
            promise.then(() => {
                if(databaseVersionRef.current !== lastNotifiedDatabaseVersion.current) {
                    console.log(`Consumer finished db update, but its version ${lastNotifiedDatabaseVersion.current} does not match the current version ${databaseVersionRef.current}`)
                    createPromise()
                } else {
                    console.log(`Finalizing consumer db update (after promise fulfillment) on db version ${databaseVersionRef.current}`)
                    consumerDatabaseUpdateInProgress.current = false
                }
            })
            .catch(() => {
                if(databaseVersionRef.current !== lastNotifiedDatabaseVersion.current) {
                    console.log(`Consumer finished db update, but its version ${lastNotifiedDatabaseVersion.current} does not match the current version ${databaseVersionRef.current}`)
                    createPromise()
                } else {
                    console.log(`Finalizing consumer db update (after promise rejection) on db version ${databaseVersionRef.current}`)
                    consumerDatabaseUpdateInProgress.current = false
                }
            })
        }

        createPromise()
    }

    return (
        <FamilyTreeStateContext.Provider value={{
            get rootNode() {
                if(!rootNode) {
                    throw new Error('Attempted to access root node of empty tree')
                }
                return rootNode
            },
            setRootProfile,
            focusedProfileId,
            focusedSpousalRelationshipId,
            focusedChildRelationshipId,
            setFocusedObjectId(type, id) {
                switch(type) {
                    case 'Profile': {
                        setFocusedProfileId(id)
                        setFocusedSpousalRelationshipId(null)
                        setFocusedChildRelationshipId(null)
                        break
                    }
                    case 'SpousalRelationship': {
                        setFocusedProfileId(null)
                        setFocusedSpousalRelationshipId(id)
                        setFocusedChildRelationshipId(null)
                        break
                    }
                    case 'ChildRelationship': {
                        setFocusedProfileId(null)
                        setFocusedSpousalRelationshipId(null)
                        setFocusedChildRelationshipId(id)
                        break
                    }
                    default: {
                        throw new Error(`Unrecognized object type ${type}`)
                    }
                }
            },
            editing,
            setEditing,
            profiles: Object.values(database.profiles),
            getNodesBy(predicate: (node: AbstractFamilyTreeNode) => boolean) {
                return builder?.find_nodes_by(predicate) ?? []
            },
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
            getObjectById<T extends ObjectType>(type: T, id: string): ObjectTypeToInterface[T] {
                switch(type) {
                    case 'Profile': {
                        return database.profiles[id] as ObjectTypeToInterface[T]
                    }
                    case 'SpousalRelationship': {
                        return database.spousal_relationships[id] as ObjectTypeToInterface[T]
                    }
                    case 'ChildRelationship': {
                        return database.child_relationships[id] as ObjectTypeToInterface[T]
                    }
                    default: {
                        throw new Error(`Unrecognized object type ${type}`)
                    }
                }
            },
            hasParents(profile: Profile) {
                const childRelationship = Object.values(database.child_relationships)
                    .find(relationship => relationship.child_profile_id === profile.profile_id)
                
                return !!childRelationship
            },
            addNewProfile(profile: Profile) {
                DatabaseBuilder.fromExisting(database).addNewProfile(profile)
                cycleDatabaseVersion()
            },
            replaceProfile(profile: Profile) {
                DatabaseBuilder.fromExisting(database).replaceProfile(profile)
                if(profile.profile_id === rootProfile?.profile_id) {
                    setRootProfile(profile)
                }
                cycleDatabaseVersion()
            },
            makeSpouses(profile1: Profile, profile2: Profile) {
                const relationship = DatabaseBuilder.fromExisting(database).makeSpouses(profile1, profile2)
                cycleDatabaseVersion()
                return relationship
            },
            makeChild(parentRelationship: SpousalRelationship, profile: Profile) {
                DatabaseBuilder.fromExisting(database).makeChild(parentRelationship, profile)
                cycleDatabaseVersion()
            },
            disconnectChild(child: Profile) {
                const childRelationship = Object.values(database.child_relationships)
                    .find(relationship => relationship.child_profile_id === child.profile_id)

                if(!childRelationship) {
                    throw new Error(`Profile ${child} was not a child of anything`)
                }

                delete database.child_relationships[childRelationship.relationship_id]

                cycleDatabaseVersion()
            },
            disconnectSpouses(relationship: SpousalRelationship) {
                const childRelationships = Object.values(database.child_relationships)
                    .filter(childRelationship => childRelationship.parent_relationship_id === relationship.relationship_id)

                childRelationships.forEach(childRelationship => {
                    delete database.child_relationships[childRelationship.relationship_id]
                })

                delete database.spousal_relationships[relationship.relationship_id]

                cycleDatabaseVersion()
            }
        }}>
            {children}
        </FamilyTreeStateContext.Provider>
    )
}

export { FamilyTreeStateContext, FamilyTreeStateProvider }
