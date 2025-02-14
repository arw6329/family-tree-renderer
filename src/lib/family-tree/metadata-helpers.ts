import { ComplexDate } from "./ComplexDate";
import { isComplexDate } from "./date-utils";
import { NodeMetadata } from "./FamilyTreeDatabase";

export function getBirthDate(metadata: NodeMetadata[]): ComplexDate | null {
    const date = (metadata.find(record => record.type === 'simple' && record.key === 'BIRTH')
        ?.children.find(record => record.type === 'simple' && record.key === 'DATE') as NodeMetadata & {type: 'simple'})
        ?.value

    if(date && isComplexDate(date)) {
        return date
    }
    
    return null
}

export function getDeathDate(metadata: NodeMetadata[]): ComplexDate | null {
    const date = (metadata.find(record => record.type === 'simple' && record.key === 'DEATH')
        ?.children.find(record => record.type === 'simple' && record.key === 'DATE') as NodeMetadata & {type: 'simple'})
        ?.value

    if(date && isComplexDate(date)) {
        return date
    }
    
    return null
}

export function setBirthDate(metadata: NodeMetadata[], date: ComplexDate | null): NodeMetadata[] {
    const birthRecord = metadata.find(record => record.type === 'simple' && record.key === 'BIRTH')
    const dateRecord = birthRecord?.children.find(record => record.type === 'simple' && record.key === 'DATE') as NodeMetadata & {type: 'simple'}

    if(dateRecord) {
        dateRecord.value = date
    } else if(birthRecord && date) {
        // date truthiness check avoids pushing new DATE node with null value
        birthRecord.children.push({
            type: 'simple',
            key: 'DATE',
            value: date,
            children: []
        })
    } else if(date) {
        // date truthiness check avoids pushing new empty BIRTH node
        metadata.push({
            type: 'simple',
            key: 'BIRTH',
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

export function setDeathDate(metadata: NodeMetadata[], date: ComplexDate | null): NodeMetadata[] {
    const deathRecord = metadata.find(record => record.type === 'simple' && record.key === 'DEATH')
    const dateRecord = deathRecord?.children.find(record => record.type === 'simple' && record.key === 'DATE') as NodeMetadata & {type: 'simple'}

    if(dateRecord) {
        dateRecord.value = date
    } else if(deathRecord && date) {
        deathRecord.children.push({
            type: 'simple',
            key: 'DATE',
            value: date,
            children: []
        })
    } else if(date) {
        metadata.push({
            type: 'simple',
            key: 'DEATH',
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
