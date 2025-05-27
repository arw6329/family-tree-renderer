import * as gedcom from 'gedcom'
import { GedcomNode } from './GedcomNode'
import { GedcomError } from './GedcomError'
import { raise } from '@/lib/util/raise'
import { FamilyTreeDatabase, NodeMetadata, Profile } from '../FamilyTreeDatabase'
import { prettyChildrenOf, prettyNode } from './prettify-metadata'

type GedcomRoot = {
    children: GedcomNode[]
}

function ensureGedcomNode(obj: unknown): GedcomNode {
    if(typeof obj !== 'object' || obj === null) {
        console.log('Error while parsing node', obj)
        throw new GedcomError('Node is not an object')
    }

    if(!('children' in obj) || !(obj.children instanceof Array)) {
        console.log('Error while parsing node', obj)
        throw new GedcomError('Node had no child array associated with it')
    }

    obj.children.forEach(child => ensureGedcomNode(child))

    if(!('type' in obj) || typeof obj.type !== 'string') {
        console.log('Error while parsing node', obj)
        throw new GedcomError('Node had no type associated with it')
    }

    if('value' in obj && typeof obj.value !== 'string' && obj.value !== undefined) {
        console.log('Error while parsing node', obj)
        throw new GedcomError('Node had non-string, non-undefined value')
    }

    if(!('data' in obj)
        || obj.data === null
        || obj.data === undefined
        || typeof obj.data !== 'object'
        || ('formal_name' in obj.data && obj.data.formal_name !== undefined && typeof obj.data.formal_name !== 'string')
        || ('xref_id' in obj.data && obj.data.xref_id !== undefined && typeof obj.data.xref_id !== 'string')
        || ('pointer' in obj.data && obj.data.pointer !== undefined && typeof obj.data.pointer !== 'string')
    ) {
        console.log('Error while parsing node', obj)
        throw new GedcomError('Node had malformed data')
    }

    return obj as GedcomNode
}

function ensureGedcomRoot(obj: ReturnType<typeof gedcom.parse>): GedcomRoot {
    return {
        children: obj.children.map(child => ensureGedcomNode(child))
    }
}

export type PrunedGedcomNode = {
    key: string,
    formal_name: string | null,
    gedcom_id: string | null,
    pointer: string | null,
    value: string | null,
    children: PrunedGedcomNode[]
}

// Strips out children we don't need, flattens some referenced nodes (although this might never be possible?)
function preprocessGedcomNode(node: GedcomNode, root: GedcomRoot): PrunedGedcomNode {
    const excluded_children = ['FAMC', 'FAMS']
    const non_flattened_children = ['HUSB', 'WIFE', 'CHIL', 'SOUR', 'REPO']

    const children = node.children.filter(child => !excluded_children.includes(child.type))
    
    if(node.data.pointer && !non_flattened_children.includes(node.type)) {
        const reffed_node = root.children.find(other => other.data.xref_id === node.data.pointer)
            ?? raise(new GedcomError('Node referenced nonexistant xref_id'))
        
        reffed_node.children.forEach(child => {
            if(!excluded_children.includes(child.type)) {
                children.push(child)
            }
        })

        return {
            key: node.type,
            formal_name: node.data.formal_name ?? null,
            gedcom_id: reffed_node.data.xref_id ?? null,
            pointer: node.data.pointer,
            value: node.value ?? reffed_node.value ?? null,
            children: children.map(child => preprocessGedcomNode(child, root))
        }
    } else {
        return {
            key: node.type,
            formal_name: node.data.formal_name ?? null,
            gedcom_id: node.data.xref_id ?? null,
            pointer: node.data.pointer ?? null,
            value: node.value ?? null,
            children: children.map(child => preprocessGedcomNode(child, root))
        }
    }
}

function childOf(node: PrunedGedcomNode, key: string): PrunedGedcomNode | null {
    const child = node.children.find(child => child.key === key) ?? null

    return child ?? null
}

function allChildrenOf(node: PrunedGedcomNode, key: string): PrunedGedcomNode[] {
    return node.children.filter(child => child.key === key)

}

function missingProfile(): Profile {
    return {
        profile_id: crypto.randomUUID(),
        name: '<missing name>',
        family_tree_gender: 'NEUTRAL',
        metadata: []
    }
}

export function parseGedcom(input: string): FamilyTreeDatabase {
    const gedcom_json = ensureGedcomRoot(gedcom.parse(input))

    const db: FamilyTreeDatabase = {
        root_metadata: {},
        profiles: {},
        spousal_relationships: {},
        child_relationships: {}
    }

    const identifier_rewrites: Record<string, string> = {}

    // REPOSITORY nodes first, since SOURCE nodes can ref them
    gedcom_json.children.filter(gedcom_node => gedcom_node.type === 'REPO').forEach(gedcom_node => {
        const node = preprocessGedcomNode(gedcom_node, gedcom_json)

        if(!node.gedcom_id) {
            throw new GedcomError('REPOSITORY node did not have a cross-reference identifier')
        }

        const metadata_id = crypto.randomUUID()

        db.root_metadata[metadata_id] = prettyNode(node, identifier_rewrites)

        identifier_rewrites[node.gedcom_id] = metadata_id
    })

    gedcom_json.children.filter(gedcom_node => gedcom_node.type === 'SOUR').forEach(gedcom_node => {
        const node = preprocessGedcomNode(gedcom_node, gedcom_json)

        if(!node.gedcom_id) {
            throw new GedcomError('SOURCE node did not have a cross-reference identifier')
        }

        const metadata_id = crypto.randomUUID()

        db.root_metadata[metadata_id] = prettyNode(node, identifier_rewrites)

        identifier_rewrites[node.gedcom_id] = metadata_id
    })

    gedcom_json.children.filter(gedcom_node => gedcom_node.type === 'INDI').forEach(gedcom_node => {
        const node = preprocessGedcomNode(gedcom_node, gedcom_json)
        
        const name_node = childOf(node, 'NAME')
        const full_name = name_node?.value?.replaceAll('/', '')

        const profile = {
            profile_id: node.gedcom_id || crypto.randomUUID(),
            name: full_name || '<missing name>',
            metadata: prettyChildrenOf(node, identifier_rewrites),
            family_tree_gender:
                childOf(node, 'SEX')?.value === 'M'
                    ? 'MALE' as const
                : childOf(node, 'SEX')?.value === 'F'
                    ? 'FEMALE' as const
                    : 'NEUTRAL' as const,
        }

        db.profiles[profile.profile_id] = profile
    })

    gedcom_json.children.filter(gedcom_node => gedcom_node.type === 'FAM').forEach(gedcom_node => {
        const node = preprocessGedcomNode(gedcom_node, gedcom_json)
        
        const spouse_1_node = childOf(node, 'HUSB')
        let spouse_1 = spouse_1_node
            ? db.profiles[spouse_1_node.pointer ?? raise(new GedcomError('HUSB node had no pointer'))]
            : null

        if(!spouse_1) {
            const missing_spouse = missingProfile()
            db.profiles[missing_spouse.profile_id] = missing_spouse
            spouse_1 = missing_spouse
        }

        const spouse_2_node = childOf(node, 'WIFE')
        let spouse_2 = spouse_2_node
            ? db.profiles[spouse_2_node.pointer ?? raise(new GedcomError('WIFE node had no pointer'))]
            : null

        if(!spouse_2) {
            const missing_spouse = missingProfile()
            db.profiles[missing_spouse.profile_id] = missing_spouse
            spouse_2 = missing_spouse
        }

        const existing_relationship = Object.values(db.spousal_relationships).find(relationship =>
            (relationship.spouse_1_profile_id === spouse_1!.profile_id
                && relationship.spouse_2_profile_id === spouse_2!.profile_id)
            || (relationship.spouse_1_profile_id === spouse_2!.profile_id
                && relationship.spouse_2_profile_id === spouse_1!.profile_id)
        )

        const relationship = existing_relationship ?? {
            relationship_id: node.gedcom_id ?? crypto.randomUUID(),
            spouse_1_profile_id: spouse_1.profile_id,
            spouse_2_profile_id: spouse_2.profile_id,
            description: null,
            metadata: prettyChildrenOf(node, identifier_rewrites),
            type: 'MARRIAGE'
        }

        if(existing_relationship) {
            console.log(`Merging spousal relationship ${node.gedcom_id} into ${existing_relationship.relationship_id}`)
            existing_relationship.metadata = [
                ...existing_relationship.metadata,
                ...prettyChildrenOf(node, identifier_rewrites)
            ]
        } else {
            db.spousal_relationships[relationship.relationship_id] = relationship
        }

        const child_nodes = allChildrenOf(node, 'CHIL')
        child_nodes.forEach(child_node => {
            const child_relationship = {
                relationship_id: crypto.randomUUID(),
                parent_relationship_id: relationship.relationship_id,
                child_profile_id: child_node.pointer ?? raise(new GedcomError('CHIL node had no pointer')),
                metadata: prettyChildrenOf(child_node, identifier_rewrites),
                type: null,
                description: null
            }

            db.child_relationships[child_relationship.relationship_id] = child_relationship
        })
    })

    return db
}
