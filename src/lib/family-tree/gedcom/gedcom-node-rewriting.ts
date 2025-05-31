import { NodeMetadata } from "../FamilyTreeDatabase"
import { parseGedcomDate } from "./date-parser"
import { GedcomNode } from "./GedcomNode"

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
            switch(node.value) {
                case 'Natural':
                    return 'BIOLOGICAL'
                case 'Adopted':
                    return 'ADOPTIVE'
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
    }

    return node
}

function *_gedcomNodeChildrenToNodeMetadata(node: GedcomNode): Generator<NodeMetadata, undefined, undefined> {
    const nonDereferencedChildren = ['HUSB', 'WIFE', 'CHIL', 'FAMC', 'FAMS']

    for(const child of node.children) {
        if(nonDereferencedChildren.includes(child.type)) {
            continue
        }

        if(!child.data.pointer) {
            const fixedChild = transformNode(child)

            const key = gedcomIdentToKey(fixedChild.type)
                ?? fixedChild.data.formal_name ?? fixedChild.type
    
            const obj: NodeMetadata = {
                type: 'simple',
                key: key,
                value: transformValue(fixedChild) ?? null,
                children: [..._gedcomNodeChildrenToNodeMetadata(fixedChild)]
            }
    
            yield obj
        } else {
            yield {
                type: 'pointer',
                pointer: child.data.pointer,
                children: [..._gedcomNodeChildrenToNodeMetadata(child)]
            }
        }
    }

    return
}

export function gedcomNodeChildrenToNodeMetadata(node: GedcomNode): NodeMetadata[] {
    return [..._gedcomNodeChildrenToNodeMetadata(node)]
}

export function gedcomNodeToMetadata(node: GedcomNode): NodeMetadata {
    return gedcomNodeChildrenToNodeMetadata({
        type: '_DUMMY',
        data: {
            formal_name: 'DUMMY'
        },
        value: undefined,
        children: [ node ]
    })[0]
}