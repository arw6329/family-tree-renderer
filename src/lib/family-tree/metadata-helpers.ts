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

export function derefRecord(
    record: NodeMetadata,
    metadataLookup: (id: string) => NodeMetadata | null, // TODO: eventually replace me with DatabaseView
    encounteredPointers: string[] = []
): NodeMetadata & { type: 'simple' } {
    if(record.type === 'pointer') {
        if(encounteredPointers.includes(record.pointer)) {
            console.warn('Found vertical cycle when dereferencing metadata - skipping child')
            return {
                type: 'simple',
                key: 'ERROR',
                value: '<self-referential record>',
                children: []
            }
        } else {
            encounteredPointers.push(record.pointer)
        }
    }

    const children = [...record.children]
    let currentRecord: NodeMetadata = record
    const localEncounteredRecords: NodeMetadata[] = []
    while(currentRecord.type === 'pointer') {
        localEncounteredRecords.push(currentRecord)

        currentRecord = metadataLookup(currentRecord.pointer) ?? {
            type: 'simple',
            key: 'ERROR',
            value: '<reference to missing metadata>',
            children: []
        }

        if(localEncounteredRecords.includes(currentRecord)) {
            console.warn('Found horizontal cycle when dereferencing metadata - breaking')
            break
        }

        for(const child of currentRecord.children) {
            children.push(child)
        }        
    }

    const dereffedRecord: NodeMetadata = {
        type: 'simple',
        key: currentRecord.key,
        value: currentRecord.value,
        children: []
    }

    for(const child of children) {
        dereffedRecord.children.push(derefRecord(child, metadataLookup, encounteredPointers))
    }

    return dereffedRecord
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

// TODO: does not work for standard GEDCOM divorce definitions
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

export function getPrimaryPhotoPath(metadata: NodeMetadata[]): string | null {
    function extractPath(objectRecord: NodeMetadata | null): string | null {
        if(!objectRecord) {
            return null
        }

        const record = getFirstRecord('FILE', objectRecord.children)
        // TODO: what if record is a pointer?
        if(record && record.type === 'simple' && typeof record.value === 'string') {
            return record.value
        }
        return null
    }

    const primaryPhoto = extractPath(getFirstRecord('PRIMARY_PHOTO', metadata))
    if(primaryPhoto) {
        return primaryPhoto
    }

    let firstObjectRecord = null
    for(const record of metadata) {
        // TODO: what if record is a pointer?
        if(record.type !== 'simple' || record.key !== 'OBJECT' ) {
            continue
        }

        if(!firstObjectRecord) {
            firstObjectRecord = record
        }

        if(getFirstRecord('PRIMARY', record.children)) {
            return extractPath(record)
        }
    }

    return extractPath(firstObjectRecord)
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
