import { remove_elem_if_present } from '../array-utils/array-utils';
import { AbstractFamilyTreeNode } from './AbstractFamilyTreeNode';
import { FamilyTreeDatabase } from './FamilyTreeDatabase';
import { MultiSpouseNode } from './MultiSpouseNode';
import { ProfileNode } from './ProfileNode'

export class TreeBuilder {
    private db: FamilyTreeDatabase
    private node_queue: AbstractFamilyTreeNode[]
    private root_node: AbstractFamilyTreeNode | null

    constructor(database: FamilyTreeDatabase) {
        this.db = database
        this.node_queue = []
        this.root_node = null
    }

    fetch_profile(profile_id: string) {
        return this.db.profiles[profile_id]
    }

    fetch_root_metadata(metadata_id: string) {
        return this.db.root_metadata[metadata_id]
    }

    // TODO: is this alternate representation really necessary?
    fetch_api_data_for_node(profile_id: string) {
        return {
            spouses: Object.values(this.db.spousal_relationships)
                .filter(s_relation => s_relation.spouse_1_profile_id === profile_id || s_relation.spouse_2_profile_id === profile_id)
                .map(s_relation => ({
                    relationship: s_relation,
                    spouse_profile: s_relation.spouse_1_profile_id === profile_id
                        ? this.fetch_profile(s_relation.spouse_2_profile_id)
                        : this.fetch_profile(s_relation.spouse_1_profile_id)
                }))
        }
    }

    construct_tree(root_node: AbstractFamilyTreeNode, _visited_ids = [], _test_index = 0) {
        if(!this.root_node) {
            this.root_node = root_node
        }

        if(!root_node) {
            return
        }

        // if(_test_index > 100) {
        //     return
        // }

        // if(_visited_ids.some(profile_id => root_node.is_representative_of(profile_id))) {
        //     return
        // }
        
        // console.log(`popped node with profile ${root_node.data.profile.profile_id}, visited = ${root_node._tmp_visited}`)

        // attach parents
        if(
            root_node instanceof ProfileNode // can't attach parents if node is representative of more than one profile - it would have multiple sets of parents
            && !_visited_ids.includes(root_node.data.profile.profile_id) // can't attach parents for already-visited spouse of incestual relationship - otherwise infinite recursion when we try to attach spouse's parents and build back down
            // TODO: second check above leads to inconsistent rendering of one or both sides of duplicated tree in certain cases    
        ) {
            let child_relationship = Object.values(this.db.child_relationships).find(relationship => relationship.child_profile_id === root_node.data.profile.profile_id)
    
            // attach parents if needed and they exist
            if(child_relationship) {
                let parent_spousal_relationship = this.db.spousal_relationships[child_relationship.parent_relationship_id]
    
                if(!root_node.left_parent && !root_node.right_parent) {
                    // console.log(`profile ${root_node.data.profile.profile_id} needs parents with id ${parent_spousal_relationship.spouse_1_profile_id}, ${parent_spousal_relationship.spouse_2_profile_id}\ncurrent node: `, root_node)
                    root_node._attach_left_parent(ProfileNode, child_relationship, parent_spousal_relationship, {
                        profile: this.db.profiles[parent_spousal_relationship.spouse_1_profile_id]
                    })
                    root_node._attach_right_parent(ProfileNode, child_relationship, parent_spousal_relationship, {
                        profile: this.db.profiles[parent_spousal_relationship.spouse_2_profile_id]
                    })
                    this.node_queue.push(root_node.left_parent)
                    this.node_queue.push(root_node.right_parent)
                } else if(!root_node.left_parent || !root_node.right_parent) {
                    // TODO: unnecessary check?
                    throw 'Error: only 1 parent registered'
                } else if(
                    !(
                        root_node.left_parent.is_representative_of(parent_spousal_relationship.spouse_1_profile_id)
                        && root_node.right_parent.is_representative_of(parent_spousal_relationship.spouse_2_profile_id)
                    ) && !(
                        root_node.right_parent.is_representative_of(parent_spousal_relationship.spouse_1_profile_id)
                        && root_node.left_parent.is_representative_of(parent_spousal_relationship.spouse_2_profile_id)
                    ) 
                ) {
                    // TODO: unnecessary check?
                    throw new Error('Error: node has parents registered, but they do not align with the node\'s parents stored in the database')
                }
            }
        }
    
        // grandparents and above don't get additional spouses
        // they break the rendering, and we can't render children of all these relationships anyway
        const skip_additional_missing_spouses = root_node.is_grandparent_or_higher_to(this.root_node)

        let spousal_relationships = Object.values(this.db.spousal_relationships)
            .filter(relationship => root_node.is_representative_of(relationship.spouse_1_profile_id) || root_node.is_representative_of(relationship.spouse_2_profile_id))
    
        // attach spouses if needed and they exist
        spousal_relationships.forEach(relationship => {
            let spouse_profile_id = root_node.is_representative_of(relationship.spouse_1_profile_id) ? relationship.spouse_2_profile_id : relationship.spouse_1_profile_id
            
            if(!root_node.right_spouse?.is_representative_of(spouse_profile_id) && !root_node.left_spouse?.is_representative_of(spouse_profile_id)) {
                // console.log(`profile ${root_node.data.profile.profile_id} needs spouse with id ${spouse_profile_id}\ncurrent node: `, root_node)
                if(skip_additional_missing_spouses) {
                    // return from forEach, go to next spouse
                    return
                }

                if(!root_node.right_spouse) {
                    root_node._attach_right_spouse(ProfileNode, relationship, {
                        profile: this.db.profiles[spouse_profile_id]
                    })
                    this.node_queue.push(root_node.right_spouse)
                } else if(!root_node.left_spouse) {
                    root_node._attach_left_spouse(ProfileNode, relationship, {
                        profile: this.db.profiles[spouse_profile_id]
                    })
                    this.node_queue.push(root_node.left_spouse)
                } else {
                    if(
                        !root_node.left_spouse.has_parent()
                        && root_node.left_spouse !== this.root_node
                        && !root_node.left_spouse.has_descendent(this.root_node)
                        && !root_node.left_spouse.left_spouse
                    ) {
                        remove_elem_if_present(this.node_queue, root_node.left_spouse)

                        MultiSpouseNode.inject_profile_left(root_node, this.db.profiles[spouse_profile_id])

                        this.node_queue.push(root_node.left_spouse)
                    } else if(
                        !root_node.right_spouse.has_parent()
                        && root_node.right_spouse !== this.root_node
                        && !root_node.right_spouse.has_descendent(this.root_node)
                        && !root_node.right_spouse.right_spouse
                    ) {
                        remove_elem_if_present(this.node_queue, root_node.right_spouse)

                        MultiSpouseNode.inject_profile_right(root_node, this.db.profiles[spouse_profile_id])

                        this.node_queue.push(root_node.right_spouse)
                    } else {
                        throw new Error('cannot inject another profile into either spouse because they both either have parents, are the root node, have other spouses, or are parents of the root node')
                    }
                }
            }
    
            let representative_node_on_right = root_node.right_spouse?.is_representative_of(spouse_profile_id)
    
            let children_with_relationship = Object.values(this.db.child_relationships)
                .filter(child_relationship => child_relationship.parent_relationship_id === relationship.relationship_id)
    
            // attach children with root_node spouse if needed and they exist
            children_with_relationship.forEach(relationship => {
                const child_id = relationship.child_profile_id
                if(representative_node_on_right) {
                    if(!root_node.right_children.some(child => child.is_representative_of(child_id))) {
                        // console.log(`profiles ${root_node.data.profile.profile_id}, ${spouse_profile_id} need child with id ${child_id}\ncurrent node: `, root_node)
                        let child = root_node._attach_right_child(ProfileNode, relationship, {
                            profile: this.db.profiles[child_id]
                        })
                        this.node_queue.push(child)
                    }
                } else {
                    if(!root_node.left_children.some(child => child.is_representative_of(child_id))) {
                        let child = root_node._attach_left_child(ProfileNode, relationship, {
                            profile: this.db.profiles[child_id]
                        })
                        this.node_queue.push(child)
                    }
                }
            })
        })
    
        if(root_node instanceof ProfileNode) {
            _visited_ids.push(root_node.data.profile.profile_id)
        }

        this.construct_tree(this.node_queue.shift(), _visited_ids, ++_test_index)
    }
}