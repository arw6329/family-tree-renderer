import { ComplexDate } from "./ComplexDate";
import { isComplexDate } from "./date-utils";
import { NodeMetadata } from "./FamilyTreeDatabase";

export function getEventDate(eventKey: string, metadata: NodeMetadata[]): ComplexDate | null {
    const date = (metadata.find(record => record.type === 'simple' && record.key === eventKey)
        ?.children.find(record => record.type === 'simple' && record.key === 'DATE') as NodeMetadata & {type: 'simple'})
        ?.value

    if(date && isComplexDate(date)) {
        return date
    }

    return null
}

export function setEventDate(eventKey: string, metadata: NodeMetadata[], date: ComplexDate | null): NodeMetadata[] {
    const eventRecord = metadata.find(record => record.type === 'simple' && record.key === eventKey)
    const dateRecord = eventRecord?.children.find(record => record.type === 'simple' && record.key === 'DATE') as NodeMetadata & {type: 'simple'}

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

export function getPedigree(metadata: NodeMetadata[]): 'adoptive' | 'biological' | 'foster' | null {
    const adoptionRecord = metadata.find(record => record.type === 'simple' && record.key === 'ADOPTION')

    if(adoptionRecord) {
        return 'adoptive'
    } else {
        return null
    }
}
