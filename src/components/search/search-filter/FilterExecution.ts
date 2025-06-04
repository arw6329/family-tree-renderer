import type { ChildRelationship, NodeMetadata, Profile } from "@/lib/family-tree/FamilyTreeDatabase";
import type { FilterDefinition } from "./FilterDefinition";
import { derefRecord } from "@/lib/family-tree/metadata-helpers";
import type { DatabaseView } from "@/lib/family-tree/DatabaseView";

export function executeFilter(
    filter: FilterDefinition | null,
    testSubject: Profile | ChildRelationship | NodeMetadata,
    database: DatabaseView
): boolean {
    if(!filter) {
        return true
    }

    switch(filter.type) {
        case 'AND': {
            for(const subfilter of filter.filters) {
                if(!executeFilter(subfilter, testSubject, database)) {
                    return false
                }
            }
            return true
        }
        case 'OR': {
            for(const subfilter of filter.filters) {
                if(executeFilter(subfilter, testSubject, database)) {
                    return true
                }
            }
            return false
        }
        case 'NOT': {
            return !executeFilter(filter.filter, testSubject, database)
        }
        case 'STRING COMPARE': {
            if(!('type' in testSubject)) {
                return false
            }

            // We do not have to deref record here. See other comments.
            if(testSubject.type === 'pointer') {
                throw new Error(`Did not expect pointer record to appear in filter execution`)
            }
            if(typeof testSubject.value !== 'string') {
                return false
            }

            switch(filter.operation) {
                case 'equals': {
                    return testSubject.value.toLowerCase() === filter.test.toLowerCase()
                }
                case 'contains': {
                    return testSubject.value.toLowerCase().includes(filter.test.toLowerCase())
                }
                case 'starts-with': {
                    return testSubject.value.toLowerCase().startsWith(filter.test.toLowerCase())
                }
                case 'ends-with': {
                    return testSubject.value.toLowerCase().endsWith(filter.test.toLowerCase())
                }
                case 'regex': {
                    return new RegExp(filter.test).test(testSubject.value)
                }
                default: {
                    throw new Error(`Unrecognized string operation ${filter.operation}`)
                }
            }
        }
        case 'DATE COMPARE': {
            throw new Error(`Filter type ${filter.type} not implemented`)
        }
        case 'CHILD RECORD': {
            // We do not have to deref testSubject or its children here if
            // testSubject is of type NodeMetadata because the only way
            // for NodeMetadata to be fed to executeFilter is from feeding a
            // Profile/SpousalRelationship/ChildRelationship as the testSubject to
            // executeFilter and having a CHILD RECORD filter run on its children, in
            // which case the children would be dereffed there. This might have to be
            // changed if searching root metadata directly is ever implemented. 
            const children = ('metadata' in testSubject
                ? testSubject.metadata.map(child => derefRecord(child, metadataId => database.getRootMetadataById(metadataId)))
                : testSubject.children) as (NodeMetadata & { type: 'simple' })[]
            
            for(const child of children) {
                if(child.key !== filter.childKey) {
                    continue
                }

                if(executeFilter(filter.filter, child, database)) {
                    return true
                } else if(filter.cardinality === 'first') {
                    return false
                }
            }
            return false
        }
        case 'PARENTS': {
            if(!('profile_id' in testSubject)) {
                return false
            }

            const parents = database.getParentsOf(testSubject)
            for(const { parent1, parent2, childRelationship } of parents) {
                if(
                    executeFilter(filter.parentFilter1, parent1, database)
                    && executeFilter(filter.parentFilter2, parent2, database)
                    && executeFilter(filter.relationshipFilter, childRelationship, database)
                ) {
                    return true
                }
            }
            return false
        }
        case 'NO-OP': {
            return true
        }
        default: {
            throw new Error(`Unrecognized filter type ${filter.type}`)
        }
    }
}
