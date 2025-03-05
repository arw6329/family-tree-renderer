import { remove_elems_by } from "../array-utils/array-utils";
import { ComplexDate } from "./ComplexDate";
import { isComplexDate } from "./date-utils";
import { NodeMetadata } from "./FamilyTreeDatabase";

type Pedigree = 'adoptive' | 'biological' | 'foster'

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

export function setPedigree(metadata: NodeMetadata[], pedigree: Pedigree | null) {
    const pedigreeRecord = metadata.find(record => record.type === 'simple' && record.key === 'PEDIGREE') as NodeMetadata & {type: 'simple'}

    if(pedigreeRecord) {
        pedigreeRecord.value = pedigree
    } else if(pedigree) {
        // pedigree truthiness check avoids pushing new empty PEDIGREE node
        metadata.push({
            type: 'simple',
            key: 'PEDIGREE',
            value: pedigree,
            children: []
        })
    }

    if(pedigree !== 'adoptive') {
        remove_elems_by(metadata, record => record.type === 'simple' && record.key === 'ADOPTION')
    }
    
    if(pedigree !== 'foster') {
        remove_elems_by(metadata, record => record.type === 'simple' && record.key === 'FOSTER')
    }
}
