interface NodeMetadata {
    [key: string]: string
}

export interface Profile {
    profile_id: string,
    name: string,
    family_tree_gender: 'NONBINARY' | 'FEMALE' | 'MALE' | 'NEUTRAL',
    metadata: NodeMetadata[]
}

export interface SpousalRelationship {
    relationship_id: string,
    spouse_1_profile_id: string,
    spouse_2_profile_id: string,
    metadata: NodeMetadata[]
}

export interface FamilyTreeDatabase {
    root_metadata: {
        [metadataId: string]: NodeMetadata
    }
    profiles: {
        [profileId: string]: Profile
    },
    spousal_relationships: {
        [spousalRelationshipId: string]: SpousalRelationship
    },
    child_relationships: {
        [childRelationshipId: string]: {
            relationship_id: string,
            parent_relationship_id: string,
            child_profile_id: string,
            metadata: NodeMetadata[]
        }
    }
}