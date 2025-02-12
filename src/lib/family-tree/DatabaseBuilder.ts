import { FamilyTreeDatabase, Profile, SpousalRelationship } from "./FamilyTreeDatabase";

export class DatabaseBuildError extends Error {}

export class DatabaseBuilder {
    private constructor(private database: FamilyTreeDatabase) {}

    static fromExisting(database: FamilyTreeDatabase) {
        return new DatabaseBuilder(database)
    }

    addNewProfile(profile: Profile) {
        if(Object.keys(this.database.profiles).includes(profile.profile_id)) {
            throw new DatabaseBuildError(`Profile ${profile.profile_id} already exists`)
        }

        this.database.profiles[profile.profile_id] = profile
    }

    makeSpouses(profile1: Profile, profile2: Profile) {
        if(profile1.profile_id === profile2.profile_id) {
            throw new DatabaseBuildError('Cannot make profile spouse of itself')
        }

        if(!(profile1.profile_id in this.database.profiles)) {
            throw new DatabaseBuildError(`Profile ${profile1.profile_id} does not exist`)
        }
        if(!(profile2.profile_id in this.database.profiles)) {
            throw new DatabaseBuildError(`Profile ${profile2.profile_id} does not exist`)
        }

        if(
            Object.values(this.database.spousal_relationships).some(relationship => 
                (relationship.spouse_1_profile_id === profile1.profile_id
                    && relationship.spouse_2_profile_id === profile2.profile_id)
                || (relationship.spouse_2_profile_id === profile1.profile_id
                    && relationship.spouse_1_profile_id === profile2.profile_id)
            )
        ) {
            throw new DatabaseBuildError(`Profiles ${profile1.profile_id} and ${profile2.profile_id} are already spouses`)
        }

        const relationship = {
            relationship_id: crypto.randomUUID(),
            spouse_1_profile_id: profile1.profile_id,
            spouse_2_profile_id: profile2.profile_id,
            metadata: []
        }
        this.database.spousal_relationships[relationship.relationship_id] = relationship
    }

    makeChild(parentRelationship: SpousalRelationship, profile: Profile) {
        if(!(parentRelationship.relationship_id in this.database.spousal_relationships)) {
            throw new DatabaseBuildError(`Spousal relationship ${parentRelationship.relationship_id} does not exist`)
        }

        if(!(profile.profile_id in this.database.profiles)) {
            throw new DatabaseBuildError(`Profile ${profile.profile_id} does not exist`)
        }

        const database = this.database // this is shadowed by generator
        const childRelationships = Object.values(this.database.child_relationships)
        function *allAncestors(profile: Profile): Generator<Profile, undefined, undefined> {
            const childRelationship = childRelationships.find(relationship => relationship.child_profile_id === profile.profile_id)
            if(childRelationship) {
                const parentsSpousalRelationship = database.spousal_relationships[childRelationship.parent_relationship_id]
                const parent1 = database.profiles[parentsSpousalRelationship.spouse_1_profile_id]
                const parent2 = database.profiles[parentsSpousalRelationship.spouse_2_profile_id]

                yield parent1
                yield parent2
                yield* allAncestors(parent1)
                yield* allAncestors(parent2)
            }
        }

        const parent1 = this.database.profiles[parentRelationship.spouse_1_profile_id]
        const parent2 = this.database.profiles[parentRelationship.spouse_2_profile_id]
        if([
            parent1,
            parent2,
            ...allAncestors(parent1),
            ...allAncestors(parent2)
        ].map(profile => profile.profile_id).includes(profile.profile_id)) {
            throw new DatabaseBuildError('Cannot make someone their own ancestor')
        }

        const relationship = {
            relationship_id: crypto.randomUUID(),
            parent_relationship_id: parentRelationship.relationship_id,
            child_profile_id: profile.profile_id,
            metadata: []
        }
        this.database.child_relationships[relationship.relationship_id] = relationship
    }
}