import { FamilyTreeDatabase, Profile } from "./FamilyTreeDatabase";

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
}