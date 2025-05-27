import { raise } from "@/lib/util/raise"
import { NodeMetadata } from "../FamilyTreeDatabase"
import { PrunedGedcomNode } from "./gedcom"
import { GedcomError } from "./GedcomError"
import { parseGedcomDate } from "./date-parser"

// export type GedcomMetadataType = 'DATE' | 'LINK' | 'COORDS' | 'GENERIC'
//     | { type: 'enum', values: { [k: string]: string } } // values is { PROGRAMMATIC_KEY: 'human readable version' }

function gedcomIdentToKey(str: string): string|null {
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
        '_MSTAT': 'MARRIAGE_STATUS' 
    } as const)[str] ?? null
}

function transformValue(node: PrunedGedcomNode) {
    switch(node.key) {
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

function transformNode(node: PrunedGedcomNode): PrunedGedcomNode {
    if(node.key === 'EVEN') {
        node = Object.assign({}, node)
        const type = node.children.find(child => child.key === 'TYPE')
        node.formal_name = type?.value ?? null
        node.children = node.children.filter(child => child !== type)
    } else if(node.key === 'MAP') {
        const lat = node.children.find(child => child.key === 'LATI')
        const long = node.children.find(child => child.key === 'LONG')
        if(node.children.length === 2 && lat?.value && long?.value) {
            node = {
                formal_name: 'COORDINATES',
                key: '_COORDS',
                gedcom_id: null,
                pointer: null,
                value: `${lat.value} ${long.value}`,
                children: []
            }
        }
    }

    return node
}

function *_prettyChildrenOf(node: PrunedGedcomNode, pointerRewrites: Record<string, string>): Generator<NodeMetadata, undefined, undefined> {
    const excluded_children = ['HUSB', 'WIFE', 'CHIL']
    const pointerized_children = ['SOUR', 'REPO']

    for(const child of node.children) {
        if(excluded_children.includes(child.key)) {
            continue
        }

        if(!child.pointer || !pointerized_children.includes(child.key)) {
            const fixedChild = transformNode(child)

            const key = gedcomIdentToKey(fixedChild.key)
                ?? fixedChild.formal_name ?? fixedChild.key
    
            const obj: NodeMetadata = {
                type: 'simple',
                key: key,
                value: transformValue(fixedChild) ?? null,
                children: [..._prettyChildrenOf(fixedChild, pointerRewrites)]
            }
    
            yield obj
        } else {
            yield {
                type: 'pointer',
                pointer: pointerRewrites[child.pointer]
                    ?? raise(new GedcomError(`Pointer ${child.pointer} was not rewritten (pointed to nonexistant or invalid node)`)),
                children: [..._prettyChildrenOf(child, pointerRewrites)]
            }
        }
    }

    return
}

export function prettyChildrenOf(node: PrunedGedcomNode, pointerRewrites: Record<string, string>): NodeMetadata[] {
    return [..._prettyChildrenOf(node, pointerRewrites)]
}

export function prettyNode(node: PrunedGedcomNode, pointerRewrites: Record<string, string>): NodeMetadata {
    return prettyChildrenOf({
        key: '_DUMMY',
        formal_name: 'DUMMY_NODE',
        gedcom_id: null,
        pointer: null,
        value: null,
        children: [ node ]
    }, pointerRewrites)[0] ?? raise(new GedcomError('Node could not be prettified'))
}
