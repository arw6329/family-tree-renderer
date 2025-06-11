type JSONValue =
    | string
    | number
    | boolean
    | null
    | JSONObject
    | Array<JSONValue>

type JSONObject = { [key: string]: JSONValue }

type JSONArray = Array<JSONValue>

export type ObjectType = 'Profile' | 'SpousalRelationship' | 'ChildRelationship'

export type ObjectTypeToInterface = {
    'Profile': Profile,
    'SpousalRelationship': SpousalRelationship,
    'ChildRelationship': ChildRelationship
}

export type NodeMetadata = {
    type: 'simple',
    key: string,
    value: JSONValue,
    children: NodeMetadata[]
} | {
    type: 'pointer',
    pointer: string,
    children: NodeMetadata[]
}

export type FlatNodeMetadata = {
    type: 'simple',
    key: string,
    value: JSONValue,
    children: FlatNodeMetadata[]
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

export interface ChildRelationship {
    relationship_id: string,
    parent_relationship_id: string,
    child_profile_id: string,
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
        [childRelationshipId: string]: ChildRelationship
    }
}