import { remove_elems_by } from "../array-utils/array-utils";
import { ComplexDate } from "./ComplexDate";
import { isComplexDate } from "./date-utils";
import { NodeMetadata } from "./FamilyTreeDatabase";

type Pedigree = 'adoptive' | 'biological' | 'foster'
export type SpousalRelationshipType = 'married' | 'divorced' | 'never-married'

export function getFirstRecord(key: string, metadata: NodeMetadata[]): NodeMetadata | null {
    return metadata.find(record => record.type === 'simple' && record.key === key) ?? null
}

export function blankRecord(key: string): NodeMetadata {
    return {
        type: 'simple' as const,
        key: key,
        value: null,
        children: []
    }
}

export function getEventDate(eventKey: string, metadata: NodeMetadata[]): ComplexDate | null {
    const date = (metadata.find(record => record.type === 'simple' && record.key === eventKey)
        ?.children.find(record => record.type === 'simple' && record.key === 'DATE') as NodeMetadata & {type: 'simple'})
        ?.value

    if(date && isComplexDate(date)) {
        return date
    }

    return null
}

// TODO: match signature of getPedigree and don't return metadata (mutate only)
export function setEventDate(eventKey: string, metadata: NodeMetadata[], date: ComplexDate | null): NodeMetadata[] {
    const eventRecord = metadata.find(record => record.type === 'simple' && record.key === eventKey)
    const dateRecord = eventRecord?.children.find(record => record.type === 'simple' && record.key === 'DATE') as (NodeMetadata & {type: 'simple'}) | undefined

    if(dateRecord) {
        dateRecord.value = date
    } else if(eventRecord && date) {
        // date truthiness check avoids pushing new DATE node with null value
        eventRecord.children.push({
            type: 'simple',
            key: 'DATE',
            value: date,
            children: []
        })
    } else if(date) {
        // date truthiness check avoids pushing new empty EVENT node
        metadata.push({
            type: 'simple',
            key: eventKey,
            value: null,
            children: [{
                type: 'simple',
                key: 'DATE',
                value: date,
                children: []
            }]
        })
    }

    return metadata
}

export function getPedigree(metadata: NodeMetadata[]): Pedigree | null {
    const pedigreeRecord = metadata.find(record => record.type === 'simple' && record.key === 'PEDIGREE') as (NodeMetadata & {type: 'simple'}) | undefined

    switch(pedigreeRecord?.value) {
        // avoids returning null pedigree (and unknown values)
        // in case other data (like adoption record) exists
        case 'adoptive':
        case 'foster':
        case 'biological': {
            return pedigreeRecord.value
        }
    }

    const adoptionRecord = metadata.find(record => record.type === 'simple' && record.key === 'ADOPTION')

    if(adoptionRecord) {
        return 'adoptive'
    }

    return null
}

export function getSpousalRelationshipType(metadata: NodeMetadata[]): SpousalRelationshipType | null {
    const marriages = metadata.filter(record => record.type === 'simple' && record.key === 'MARRIAGE') as (NodeMetadata & {type: 'simple'})[]

    if(marriages.length > 0) {
        if(marriages.every(marriage => getFirstRecord('DIVORCE', marriage.children))) {
            return 'divorced'
        } else {
            return 'married'
        }
    }

    return null
}

// Returns true if metadata includes only simple records with keys in legalChildren
// and has no records with duplicate keys
export type SimpleMetadataSpec = { [key: string]: SimpleMetadataSpec }
export function isMetadataSimple(metadata: NodeMetadata[], simpleSchema: SimpleMetadataSpec): boolean {
    const encounteredChildren: string[] = []
    for(const record of metadata) {
        if(record.type === 'pointer') {
            return false
        }

        if(encounteredChildren.includes(record.key)) {
            return false
        }

        if(!(record.key in simpleSchema)) {
            return false
        }

        if(!isMetadataSimple(record.children, simpleSchema[record.key])) {
            return false
        }

        encounteredChildren.push(record.key)
    }
    return true
}
