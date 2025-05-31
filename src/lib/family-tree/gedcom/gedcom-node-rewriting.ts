import { NodeMetadata } from "../FamilyTreeDatabase"
import { parseGedcomDate } from "./date-parser"
import { GedcomNode } from "./GedcomNode"
import equal from "deep-equal"

// export type GedcomMetadataType = 'DATE' | 'LINK' | 'COORDS' | 'GENERIC'
//     | { type: 'enum', values: { [k: string]: string } } // values is { PROGRAMMATIC_KEY: 'human readable version' }

export function gedcomIdentToKey(str: string): string|null {
    return ({
        'SEX': 'GENDER',
        '_MREL': 'MATERNAL_PEDIGREE',
        '_FREL': 'FRATERNAL_PEDIGREE',
        '_PHOTO': 'PRIMARY_PHOTO',
        '_DATE': 'DATE',
        '_TEXT': 'NOTE',
        'SPFX': 'SURNAME_PREFIX',
        '_LINK': 'LINK',
        '_COORDS': 'COORDINATES',
        'PHON': 'PHONE_NUMBER',
        '_MSTAT': 'MARRIAGE_STATUS',
        '_PRIM': 'PRIMARY',
        '_TYPE': 'TYPE',
        'PLAC': 'LOCATION',
        'EMAIL': 'EMAIL'
    } as const)[str] ?? null
}

function transformValue(node: GedcomNode) {
    switch(node.type) {
        case 'SEX':
            switch(node.value) {
                case 'M':
                    return 'Male'
                case 'F':
                    return 'Female'
                default:
                    return node.value
            }
        case '_MREL':
        case '_FREL':
        case 'PEDI':
            switch(node.value?.toLowerCase()) {
                case 'natural':
                    return 'biological'
                case 'adopted':
                    return 'adoptive'
                default:
                    return node.value
            }
        case 'NAME':
            // gedcom delimites last name with slashes
            // remove these for rendering
            return node.value ? node.value.replaceAll('/', '') : null
        case 'DATE':
        case '_DATE':
            return node.value ? parseGedcomDate(node.value) : null
        default:
            return node.value
    }
}

function transformNode(node: GedcomNode): GedcomNode {
    if(node.type === 'EVEN') {
        node = structuredClone(node)
        const type = node.children.find(child => child.type === 'TYPE')
        node.data.formal_name = type?.value
        node.children = node.children.filter(child => child !== type)
    } else if(node.type === 'MAP') {
        const lat = node.children.find(child => child.type === 'LATI')
        const long = node.children.find(child => child.type === 'LONG')
        if(node.children.length === 2 && lat?.value && long?.value) {
            node = {
                type: '_COORDS',
                data: {
                    formal_name: 'COORDINATES'
                },
                value: `${lat.value} ${long.value}`,
                children: []
            }
        }
    } else if(node.type === 'FAMC' || node.type === 'CHIL') {
        const mrels = node.children.filter(child => child.type === '_MREL')
        const frels = node.children.filter(child => child.type === '_FREL')
        if(mrels.length === 1 && frels.length === 1) {
            const frelCopy = structuredClone(frels[0])
            frelCopy.type = '_MREL'
            if(equal(mrels[0], frelCopy)) {
                const children: GedcomNode[] = [{
                    type: 'PEDI',
                    data: {
                        pointer: frelCopy.data.pointer,
                        xref_id: frelCopy.data.xref_id,
                        formal_name: 'PEDIGREE'
                    },
                    value: frelCopy.value,
                    children: frelCopy.children
                }]
                for(const child of node.children) {
                    if(child.type !== '_MREL' && child.type !== '_FREL') {
                        children.push(child)
                    }
                }
                node = {
                    type: node.type,
                    data: node.data,
                    value: node.value,
                    children: children
                }
            }
        }
    }

    return node
}

export function gedcomNodeToMetadata(node: GedcomNode): NodeMetadata {
    const skippedChildren = ['HUSB', 'WIFE', 'CHIL', 'FAMC', 'FAMS']

    const fixedNode = transformNode(node)

    const children: NodeMetadata[] = []
    for(const child of fixedNode.children) {
        if(!skippedChildren.includes(child.type)) {
            children.push(gedcomNodeToMetadata(child))
        }
    }

    if(fixedNode.data.pointer) {
        return {
            type: 'pointer',
            pointer: fixedNode.data.pointer,
            children: children
        }
    } else {

        return {
            type: 'simple',
            key: gedcomIdentToKey(fixedNode.type)
                ?? fixedNode.data.formal_name ?? fixedNode.type,
            value: transformValue(fixedNode) ?? null,
            children: children
        }
    }
}