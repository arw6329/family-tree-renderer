import * as gedcom from 'gedcom'
import { GedcomNode } from './GedcomNode'
import { GedcomError } from './GedcomError'
import { raise } from '@/lib/util/raise'
import { ChildRelationship, FamilyTreeDatabase, Profile } from '../FamilyTreeDatabase'
import { gedcomNodeToMetadata } from './gedcom-node-rewriting'

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

function childOf(node: GedcomNode, key: string): GedcomNode | null {
    const child = node.children.find(child => child.type === key) ?? null

    return child ?? null
}

function allChildrenOf(node: GedcomNode, key: string): GedcomNode[] {
    return node.children.filter(child => child.type === key)

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

    // These need processed after all spousal/child relationships are in place
    const famcNodes: {
        [childProfileId: string]: GedcomNode[]
    } = {}

    for(const gedcom_node of gedcom_json.children) {
        if(gedcom_node.type === 'INDI') {            
            const name_node = childOf(gedcom_node, 'NAME')
            const full_name = name_node?.value?.replaceAll('/', '')

            const profile = {
                profile_id: gedcom_node.data.xref_id || crypto.randomUUID(),
                name: full_name || '<missing name>',
                metadata: gedcomNodeToMetadata(gedcom_node).children,
                family_tree_gender:
                    childOf(gedcom_node, 'SEX')?.value === 'M'
                        ? 'MALE' as const
                    : childOf(gedcom_node, 'SEX')?.value === 'F'
                        ? 'FEMALE' as const
                        : 'NEUTRAL' as const,
            }

            for(const child of gedcom_node.children) {
                if(child.type === 'FAMC') {
                    if(!famcNodes[profile.profile_id]) {
                        famcNodes[profile.profile_id] = []
                    }
                    famcNodes[profile.profile_id].push(child)
                }
            }

            db.profiles[profile.profile_id] = profile
        } else if(gedcom_node.type === 'FAM') {    
            // TODO: this can result in missing spouse if the FAM appears before the INDI        
            const spouse_1_node = childOf(gedcom_node, 'HUSB')
            let spouse_1 = spouse_1_node
                ? db.profiles[spouse_1_node.data.pointer ?? raise(new GedcomError('HUSB node had no pointer'))]
                : null

            if(!spouse_1) {
                const missing_spouse = missingProfile()
                db.profiles[missing_spouse.profile_id] = missing_spouse
                spouse_1 = missing_spouse
            }

            const spouse_2_node = childOf(gedcom_node, 'WIFE')
            let spouse_2 = spouse_2_node
                ? db.profiles[spouse_2_node.data.pointer ?? raise(new GedcomError('WIFE node had no pointer'))]
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
                relationship_id: gedcom_node.data.xref_id ?? crypto.randomUUID(),
                spouse_1_profile_id: spouse_1.profile_id,
                spouse_2_profile_id: spouse_2.profile_id,
                metadata: gedcomNodeToMetadata(gedcom_node).children,
            }

            if(existing_relationship) {
                console.log(`Merging spousal relationship ${gedcom_node.data.xref_id} into ${existing_relationship.relationship_id}`)
                existing_relationship.metadata = [
                    ...existing_relationship.metadata,
                    ...gedcomNodeToMetadata(gedcom_node).children
                ]
            } else {
                db.spousal_relationships[relationship.relationship_id] = relationship
            }

            const child_nodes = allChildrenOf(gedcom_node, 'CHIL')
            child_nodes.forEach(child_node => {
                const child_relationship = {
                    relationship_id: crypto.randomUUID(),
                    parent_relationship_id: relationship.relationship_id,
                    child_profile_id: child_node.data.pointer ?? raise(new GedcomError('CHIL node had no pointer')),
                    metadata: gedcomNodeToMetadata(child_node).children,
                }

                db.child_relationships[child_relationship.relationship_id] = child_relationship
            })
        }
        
        if(gedcom_node.data.xref_id) {
            db.root_metadata[gedcom_node.data.xref_id] = gedcomNodeToMetadata(gedcom_node)
        }
    }

    for(const childProfileId in famcNodes) {
        const nodes = famcNodes[childProfileId]

        for(const node of nodes) {
            if(!node.data.pointer) {
                throw new GedcomError(`FAMC node for INDI ${childProfileId} had no pointer`)
            }

            let relationship: ChildRelationship | null = null
            for(const relationshipId in db.child_relationships) {
                const _relationship = db.child_relationships[relationshipId]
                if(
                    _relationship.child_profile_id === childProfileId
                    && _relationship.parent_relationship_id === node.data.pointer
                ) {
                    relationship = _relationship
                }
            }

            if(!relationship) {
                throw new GedcomError(`FAMC node for INDI ${childProfileId} referenced nonexistent family ${node.data.pointer}`)
            }

            relationship.metadata.push(...gedcomNodeToMetadata(node).children)
        }
    }

    return db
}
