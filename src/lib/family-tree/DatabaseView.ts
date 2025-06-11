import { raise } from "../util/raise"
import type { ChildRelationship, FamilyTreeDatabase, FlatNodeMetadata, NodeMetadata, ObjectType, ObjectTypeToInterface, Profile, SpousalRelationship } from "./FamilyTreeDatabase"
import { derefRecord } from "./metadata-helpers"

// TODO: replace all manual accesses of FamilyTreeDatabase with this class.
// Maybe would even be nice to combine this with DatabaseBuilder.
export class DatabaseView {
    // TODO: remember to invalidate on edits
    private internalCache: {
        dereferencedMetadata: {
            profiles: {
                [profileId: string]: FlatNodeMetadata[]
            }
            spousalRelationships: {
                [relationshipId: string]: FlatNodeMetadata[]
            }
            childRelationships: {
                [relationshipId: string]: FlatNodeMetadata[]
            }
        }
    }

    private constructor(private database: FamilyTreeDatabase) {
        this.internalCache = {
            dereferencedMetadata: {
                profiles: {},
                spousalRelationships: {},
                childRelationships: {}
            }
        }
    }
    
    static fromExisting(database: FamilyTreeDatabase) {
        return new DatabaseView(database)
    }

    getSpousesOf(profile: Profile): { spouse: Profile, relationship: SpousalRelationship }[] {
        const spouses = []
        for(const relationshipId in this.database.spousal_relationships) {
            const relationship = this.database.spousal_relationships[relationshipId]
            if(relationship.spouse_1_profile_id === profile.profile_id) {
                spouses.push({
                    spouse: this.database.profiles[relationship.spouse_2_profile_id],
                    relationship: relationship
                })
            } else if(relationship.spouse_2_profile_id === profile.profile_id) {
                spouses.push({
                    spouse: this.database.profiles[relationship.spouse_1_profile_id],
                    relationship: relationship
                })
            }
        }
        return spouses
    }

    getChildrenOf(spousalRelationship: SpousalRelationship): { child: Profile, relationship: ChildRelationship }[] {
        const children = []
        for(const relationshipId in this.database.child_relationships) {
            const childRelationship = this.database.child_relationships[relationshipId]
            if(childRelationship.parent_relationship_id === spousalRelationship.relationship_id) {
                children.push({
                    child: this.database.profiles[childRelationship.child_profile_id],
                    relationship: childRelationship
                })
            }
        }
        return children
    }

    getParentsOf(profile: Profile): { parent1: Profile, parent2: Profile, childRelationship: ChildRelationship, spousalRelationship: SpousalRelationship }[] {
        const parents: ReturnType<DatabaseView['getParentsOf']> = []
        for(const childRelationshipId in this.database.child_relationships) {
            const childRelationship = this.database.child_relationships[childRelationshipId]
            if(childRelationship.child_profile_id === profile.profile_id) {
                const parentsSpousalRelationship = this.database.spousal_relationships[childRelationship.parent_relationship_id]
                parents.push({
                    parent1: this.database.profiles[parentsSpousalRelationship.spouse_1_profile_id],
                    parent2: this.database.profiles[parentsSpousalRelationship.spouse_2_profile_id],
                    spousalRelationship: parentsSpousalRelationship,
                    childRelationship: childRelationship
                })
            }
        }
        return parents
    }

    getRelationshipBetween(profile1: Profile, profile2: Profile): SpousalRelationship | null {
        const relationship = Object.values(this.database.spousal_relationships)
            .find(relationship =>
                (relationship.spouse_1_profile_id === profile1.profile_id
                    && relationship.spouse_2_profile_id === profile2.profile_id)
                || (relationship.spouse_2_profile_id === profile1.profile_id
                    && relationship.spouse_1_profile_id === profile2.profile_id)
            )

        return relationship ?? null
    }

    getObjectById<T extends ObjectType>(type: T, id: string): ObjectTypeToInterface[T] | null {
        switch(type) {
            case 'Profile': {
                return this.database.profiles[id] as ObjectTypeToInterface[T] | null
            }
            case 'SpousalRelationship': {
                return this.database.spousal_relationships[id] as ObjectTypeToInterface[T] | null
            }
            case 'ChildRelationship': {
                return this.database.child_relationships[id] as ObjectTypeToInterface[T] | null
            }
            default: {
                throw new Error(`Unrecognized object type ${type}`)
            }
        }
    }

    getRootMetadataById(metadataId: string): NodeMetadata | null {
        return this.database.root_metadata[metadataId]
    }

    getAllObjects<T extends ObjectType>(type: T): ObjectTypeToInterface[T][] {
        switch(type) {
            case 'Profile': {
                return Object.values(this.database.profiles) as ObjectTypeToInterface[T][]
            }
            case 'SpousalRelationship': {
                return Object.values(this.database.spousal_relationships) as ObjectTypeToInterface[T][]
            }
            case 'ChildRelationship': {
                return Object.values(this.database.child_relationships) as ObjectTypeToInterface[T][]
            }
            default: {
                throw new Error(`Unrecognized object type ${type}`)
            }
        }
    }

    getDereferencedMetadata(object: Profile | SpousalRelationship | ChildRelationship): FlatNodeMetadata[] {
        const type: ObjectType = 'profile_id' in object
            ? 'Profile'
            : 'spouse_1_profile_id' in object
            ? 'SpousalRelationship'
            : 'parent_relationship_id' in object
            ? 'ChildRelationship'
            : raise(`Unrecognized object type: ${JSON.stringify(object)}`)
        
        const cache = {
            'Profile': this.internalCache.dereferencedMetadata.profiles,
            'SpousalRelationship': this.internalCache.dereferencedMetadata.spousalRelationships,
            'ChildRelationship': this.internalCache.dereferencedMetadata.childRelationships
        }[type]

        const objectId = {
            'Profile': (object as Profile).profile_id,
            'SpousalRelationship': (object as SpousalRelationship).relationship_id,
            'ChildRelationship': (object as ChildRelationship).relationship_id
        }[type]

        if(cache[objectId]) {
            return cache[objectId]
        } else {
            const flatMetadata = object.metadata.map(child => derefRecord(child, metadataId => this.getRootMetadataById(metadataId)))
            cache[objectId] = flatMetadata
            return flatMetadata
        }
    }
}