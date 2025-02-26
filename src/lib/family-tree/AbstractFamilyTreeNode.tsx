import SvgLine from "@/components/family-tree/svg-line/SvgLine"
import { center_of_values, move_element_to_end, move_element_to_start, remove_elem, replace_elem } from "@/lib/array-utils/array-utils"
import { JSX } from "react"
import { ChildRelationship, SpousalRelationship } from "./FamilyTreeDatabase"

const MIN_NODE_DX = 225
const GENERATION_DY = 175

type FamilyTreeNodeSubclassConstructor = {
    new (...args: ConstructorParameters<typeof AbstractFamilyTreeNode>): AbstractFamilyTreeNode
}

export abstract class AbstractFamilyTreeNode {
	static create_unconnected_node(data = {}) {
		return new this(0, null, null, null, null, [], [], {}, data)
	}

	private _x: number | undefined

	set x(val: number | undefined) {
		if(val !== undefined && (typeof val !== 'number' || isNaN(val))) {
			throw new Error('family tree node x position was set to a non-number value')
		}
		this._x = val
	}

	get x(): number {
        if(this._x === undefined) {
            this.log('Bad x value access (access before render)')
            throw new Error('Attempted to access x position of unrendered node')
        }

		return this._x
	}

    get y(): number {
        return 100 + this.generation * GENERATION_DY
    }

    private temporary_render_data: {
        has_non_minimum_inter_spouse_distance?: boolean
    }

    private treebuilder_skipped_parents: boolean
    private treebuilder_skipped_spouses: boolean

    set_skipped_parents() {
        this.treebuilder_skipped_parents = true
    }

    set_skipped_spouses() {
        this.treebuilder_skipped_spouses = true
    }

	// TODO: private constructor, move user out of constructor (rename to profile), make utility function to construct node with given profile
	// child classes shouldn't need to provide a user
	constructor(
        public generation: number,
        public left_spouse: AbstractFamilyTreeNode | null,
        public right_spouse: AbstractFamilyTreeNode | null,
        public left_parent: AbstractFamilyTreeNode | null,
        public right_parent: AbstractFamilyTreeNode | null,
        public left_children: AbstractFamilyTreeNode[],
        public right_children: AbstractFamilyTreeNode[],
        public relationship_data: {
            own_child_relationship?: ChildRelationship | null,
            right_spousal_relationship?: SpousalRelationship | null,
            left_spousal_relationship?: SpousalRelationship | null
        },
        public data: { [k: string]: any }
    ) {
		this.temporary_render_data = {}
        this.treebuilder_skipped_parents = false
        this.treebuilder_skipped_spouses = false
	}

	_attach_left_spouse(type: FamilyTreeNodeSubclassConstructor, relationship_data = null, data = {}) {
		let new_node = new type(this.generation, null, this, null, null, [], this.left_children, { right_spousal_relationship: relationship_data }, data)
		this.left_spouse = new_node
		this.relationship_data.left_spousal_relationship = relationship_data
		return new_node
	}

	_attach_right_spouse(type: FamilyTreeNodeSubclassConstructor, relationship_data = null, data = {}) {
		let new_node = new type(this.generation, this, null, null, null, this.right_children, [], { left_spousal_relationship: relationship_data }, data)
		this.right_spouse = new_node
		this.relationship_data.right_spousal_relationship = relationship_data
		return new_node
	}

	_attach_left_child(type: FamilyTreeNodeSubclassConstructor, relationship_data = null, data = {}) {
		let new_node = new type(this.generation + 1, null, null, this.left_spouse, this, [], [], { own_child_relationship: relationship_data }, data)
		this.left_children.push(new_node)
		return new_node
	}

	_attach_right_child(type: FamilyTreeNodeSubclassConstructor, relationship_data = null, data = {}) {
		let new_node = new type(this.generation + 1, null, null, this, this.right_spouse, [], [], { own_child_relationship: relationship_data }, data)
		this.right_children.push(new_node)
		return new_node
	}

	_attach_left_parent(type: FamilyTreeNodeSubclassConstructor, child_relationship_data = null, spousal_relationship_data = null, data = {}) {
		/* if we already have the other parent, then attaching its child arrays here will automatically make the new parent have this node as a child, since the other parent should have this node as a child
		   else, we need a new array containing this node for the parent's children */
		let new_node = new type(this.generation - 1, null, this.right_parent, null, null, [], this.right_parent?.left_children ?? [ this ], { right_spousal_relationship: spousal_relationship_data }, data)
		this.left_parent = new_node
		this.relationship_data.own_child_relationship = child_relationship_data
		if(this.right_parent) {
			this.right_parent.left_spouse = new_node
			this.right_parent.relationship_data.left_spousal_relationship = spousal_relationship_data
		}
		return new_node
	}

	_attach_right_parent(type: FamilyTreeNodeSubclassConstructor, child_relationship_data = null, spousal_relationship_data = null, data = {}) {
		let new_node = new type(this.generation - 1, this.left_parent, null, null, null, this.left_parent?.right_children ?? [ this ], [], { left_spousal_relationship: spousal_relationship_data }, data)
		this.right_parent = new_node
		this.relationship_data.own_child_relationship = child_relationship_data
		if(this.left_parent) {
			this.left_parent.right_spouse = new_node
			this.left_parent.relationship_data.right_spousal_relationship = spousal_relationship_data
		}
		return new_node
	}

	abstract is_representative_of(profile_id: string): boolean

	// doesn't include this node
	spouse_chain_left(): AbstractFamilyTreeNode[] {
		return [...function* (node) {
			if(node.left_spouse) {
				yield node.left_spouse
				yield* node.left_spouse.spouse_chain_left()
			}
		}(this)]
	}

	// doesn't include this node
	spouse_chain_right(): AbstractFamilyTreeNode[] {
		return [...function* (node) {
			if(node.right_spouse) {
				yield node.right_spouse
				yield* node.right_spouse.spouse_chain_right()
			}
		}(this)]
	}

	// includes this node
	full_spouse_chain_left_to_right() {
		let leftmost_spouse: AbstractFamilyTreeNode = this
		while(leftmost_spouse.left_spouse)
			leftmost_spouse = leftmost_spouse.left_spouse

		return [leftmost_spouse, ...leftmost_spouse.spouse_chain_right()]
	}

	// returns this node, its spouses, all of their children, and all spouses and children reachable from this node's spouses (step-children and beyond)
	all_decendents_across_spouse_chain(): AbstractFamilyTreeNode[] {
		return [
			...this.full_spouse_chain_left_to_right(),
			...([
				...this.full_spouse_chain_left_to_right().map(spouse => spouse.left_children).flat(),
				...this.full_spouse_chain_left_to_right().at(-1).right_children
			].map(child => child.all_decendents_across_spouse_chain()).flat())
		]
	}

	all_decendents_across_spouse_chain_left_until_node_exclusive(stopnode: AbstractFamilyTreeNode) {
		const spouse_chain = this.full_spouse_chain_left_to_right()
		const stopnode_index = spouse_chain.indexOf(stopnode)

		if(stopnode_index < 0) {
			throw new Error('stopnode not found in spouse chain')
		}

		const trimmed_spouse_chain = spouse_chain.slice(0, stopnode_index)

		if(trimmed_spouse_chain.length === 0) {
			return []
		}

		return [
			...trimmed_spouse_chain,
			...([
				...trimmed_spouse_chain.map(spouse => spouse.left_children).flat(),
				...trimmed_spouse_chain.at(-1).right_children
			].map(child => child.all_decendents_across_spouse_chain()).flat())
		]
	}

	all_decendents_across_spouse_chain_after_node_exclusive_until_end(startnode: AbstractFamilyTreeNode) {
		const spouse_chain = this.full_spouse_chain_left_to_right()
		const startnode_index = spouse_chain.indexOf(startnode)

		if(startnode_index < 0) {
			throw new Error('startnode not found in spouse chain')
		}

		const trimmed_spouse_chain = spouse_chain.slice(startnode_index + 1)

		if(trimmed_spouse_chain.length === 0) {
			return []
		}

		return [
			...trimmed_spouse_chain,
			...([
				...trimmed_spouse_chain.map(spouse => spouse.left_children).flat(),
				...trimmed_spouse_chain.at(-1).right_children
			].map(child => child.all_decendents_across_spouse_chain()).flat())
		]
	}

	has_descendent(other: AbstractFamilyTreeNode): boolean {
		return this.left_children.includes(other)
			|| this.right_children.includes(other)
			|| this.left_children.some(child => child.has_descendent(other))
			|| this.right_children.some(child => child.has_descendent(other))
	}

	is_grandparent_or_higher_to(other: AbstractFamilyTreeNode) {
		return this.left_children.some(child => child.has_descendent(other))
			|| this.right_children.some(child => child.has_descendent(other))
	}

	// does not include this node
	all_parent_nodes(): AbstractFamilyTreeNode[] {
		function* generator(node: AbstractFamilyTreeNode): Generator<AbstractFamilyTreeNode, undefined, undefined> {
			yield node
			if(node.left_parent)
				yield* generator(node.left_parent)
			if(node.right_parent)
				yield* generator(node.right_parent)
		}
		return [
			...(this.left_parent  ? generator(this.left_parent)  : []),
			...(this.right_parent ? generator(this.right_parent) : [])
		]
	}

	all_generations_in_tree() {
		return this.all_decendents_across_spouse_chain().map(node => node.generation)
	}

	children() {
		return this.right_children.concat(this.left_children)
	}

	has_parent() {
		return this.left_parent || this.right_parent
	}

	all_siblings_and_self() {
		return this.left_parent?.children() || [ this ]
	}

	all_siblings_excluding_self() {
		return this.left_parent?.children().filter(child => child !== this) || []
	}

	move_to_left_of_siblings() {
		// TODO: are both branches needed? both are needed if only 1 parent is present
		if(this.left_parent) {
			move_element_to_start(this.left_parent.right_children, this)
		}
		if(this.right_parent) {
			move_element_to_start(this.right_parent.left_children, this)
		}
	}

	move_to_right_of_siblings() {
		if(this.left_parent) {
			move_element_to_end(this.left_parent.right_children, this)
		}
		if(this.right_parent) {
			move_element_to_end(this.right_parent.left_children, this)
		}
	}

	is_rendered() {
		return this._x !== undefined
	}

	delete() {
		if(this.left_spouse) {
			this.left_spouse.relationship_data.right_spousal_relationship = null
			this.left_spouse.right_spouse = null
		}
		if(this.right_spouse) {
			this.right_spouse.relationship_data.left_spousal_relationship = null
			this.right_spouse.left_spouse = null
		}
		if(this.left_parent) {
			remove_elem(this.left_parent.right_children, this)
		}
		if(this.right_parent && !this.left_parent) {
			// since left_parent.right_children and right_parent.left_children point to the same array, we cannot remove this element twice from both parents
			remove_elem(this.right_parent.left_children, this)
		}
		this.right_children.forEach(child => {
			child.left_parent = null
			// TODO: own_child_relationship might be wrong now for child
		})
		this.left_children.forEach(child => {
			child.right_parent = null
			// TODO: own_child_relationship might be wrong now for child
		})
	}

	replace_with(new_node: AbstractFamilyTreeNode) {
		if(
			new_node.left_parent
			|| new_node.right_parent
			|| new_node.left_spouse
			|| new_node.right_spouse
			|| new_node.left_children.length
			|| new_node.right_children.length
		) {
			throw new Error('cannot replace node with node that already has other connections')
		}

		if(this.left_parent) {
			new_node.left_parent = this.left_parent
			replace_elem(this.left_parent.right_children, this, new_node)
		}

		if(this.right_parent) {
			new_node.right_parent = this.right_parent
			replace_elem(this.right_parent.left_children, this, new_node)
		}
		
		if(this.left_spouse) {
			new_node.left_spouse = this.left_spouse
			this.left_spouse.relationship_data.right_spousal_relationship = new_node.relationship_data.left_spousal_relationship
			this.left_spouse.right_spouse = new_node
		}

		if(this.right_spouse) {
			new_node.right_spouse = this.right_spouse
			this.right_spouse.relationship_data.left_spousal_relationship = new_node.relationship_data.right_spousal_relationship
			this.right_spouse.left_spouse = new_node
		}
		
		new_node.left_children = this.left_children
		this.left_children.forEach(child => {
			child.right_parent = new_node
			// TODO: own_child_relationship might be wrong now for child
		})

		new_node.right_children = this.right_children
		this.right_children.forEach(child => {
			child.left_parent = new_node
			// TODO: own_child_relationship might be wrong now for child
		})

		new_node.generation = this.generation
		new_node.x = this._x
	}

    abstract draw(): Generator<JSX.Element, undefined, undefined>;

    /* -------------------
    * RENDERING FUNCTIONS
    * ------------------- */

    render_right_tree() {
        this.log('Node has entered render_right_tree')
        this.x = 0
        
        let spouse_chain = this.full_spouse_chain_left_to_right()
        let index_in_spouse_chain = this.spouse_chain_left().length

        // array of arrays of siblings for each family one generation below this node
        // (all my children in 1 array, half children of the same family in another,
        //  step children of same family in another, etc..)
        let full_siblings_groups = []

        spouse_chain.forEach((spouse, spouse_index) => {
            // space all spouses, spouses of spouses... using minimum possible spacing
            // more spacing might still be needed due to half and step children trees
            spouse.x = this.x + (spouse_index - index_in_spouse_chain) * MIN_NODE_DX

            // TODO: move child_tree_index to another piece of data or remove
            spouse.left_children.forEach(child => {
                child.child_tree_index = spouse_index
            })

            full_siblings_groups.push(spouse.left_children)
        })

        spouse_chain.at(-1).right_children.forEach(child => {
            child.child_tree_index = spouse_chain.length
        })

        full_siblings_groups.push(spouse_chain.at(-1).right_children)

        // TODO: replace with full_siblings_groups.flat() ?
        let all_children_across_spouses = spouse_chain.map(spouse => spouse.left_children).flat().concat(spouse_chain.at(-1).right_children)

        this.log('Rendering all children across spouses')
        all_children_across_spouses.forEach(child => child.render_right_tree())
        this.log('Done rendering all children across spouses')

        all_children_across_spouses.slice(1).forEach((child, child_i) => {
            let previous_siblings = all_children_across_spouses.slice(0, child_i + 1)
            let buf_distance = Math.max(...previous_siblings.map(previous_sibling => {
                let generations_in_common = previous_sibling.all_generations_in_tree().filter(gen => child.all_generations_in_tree().includes(gen))
                let dist_needed_between_generations = function(gen) {
                    let rightmost_x_on_prev_sibling = Math.max(...previous_sibling.all_decendents_across_spouse_chain().filter(node => node.generation == gen).map(node => node.x))
                    let leftmost_x_on_this_child = Math.min(...child.all_decendents_across_spouse_chain().filter(node => node.generation == gen).map(node => node.x))
                    return rightmost_x_on_prev_sibling - leftmost_x_on_this_child + MIN_NODE_DX
                }
                
                let buf_distance = Math.max(...generations_in_common.map(dist_needed_between_generations))
                return buf_distance
            }))

            child.all_decendents_across_spouse_chain().forEach(node => node.x += buf_distance)
        })

        let previous_group = null
        full_siblings_groups.forEach((group, group_index) => {
            if(group.length > 0) {
                if(previous_group !== null) {
                    let center_of_previous_group = (Math.min(...previous_group.map(node => node.x)) + Math.max(...previous_group.map(node => node.x))) / 2
                    let center_of_current_group = (Math.min(...group.map(node => node.x)) + Math.max(...group.map(node => node.x))) / 2

                    let min_distance_between_center_of_groups = (group[0].child_tree_index - previous_group[0].child_tree_index) * MIN_NODE_DX
                    let actual_distance_between_center_of_groups = center_of_current_group - center_of_previous_group

                    if(actual_distance_between_center_of_groups > min_distance_between_center_of_groups) {
                        spouse_chain[group[0].child_tree_index - 1].x += (actual_distance_between_center_of_groups - min_distance_between_center_of_groups) / 2
                        spouse_chain[group[0].child_tree_index - 1].spouse_chain_right().forEach(spouse => {
                            spouse.x += actual_distance_between_center_of_groups - min_distance_between_center_of_groups
                        })
                        spouse_chain[group[0].child_tree_index - 1].temporary_render_data.has_non_minimum_inter_spouse_distance = true
                        spouse_chain[group[0].child_tree_index - 1].dist_to_center_of_children = MIN_NODE_DX + (actual_distance_between_center_of_groups - min_distance_between_center_of_groups) / 2
                    } else {
                        full_siblings_groups.slice(group_index).forEach(group => {
                            group.forEach(sibling => {
                                sibling.all_decendents_across_spouse_chain().forEach(node => {
                                    node.x += min_distance_between_center_of_groups - actual_distance_between_center_of_groups
                                })
                            })
                        })
                    }
                }
                previous_group = group
            }
        })

        if(spouse_chain.length === 1) {
            // special case - children with only 1 parent need centered on parent
            // occurs when building parent trees
            let center_children = (Math.min(...all_children_across_spouses.map(node => node.x)) + Math.max(...all_children_across_spouses.map(node => node.x))) / 2
            all_children_across_spouses.forEach(child => {
                child.all_decendents_across_spouse_chain().forEach(node => {
                    node.x -= center_children
                })
            })
        } else {
            let random_sibling_group = full_siblings_groups.filter(group => group.length > 0).at(0)
            if(random_sibling_group) {
                let group_center = (Math.min(...random_sibling_group.map(node => node.x)) + Math.max(...random_sibling_group.map(node => node.x))) / 2

                let dx
                if(random_sibling_group[0].left_parent) {
                    if(random_sibling_group[0].left_parent.temporary_render_data.has_non_minimum_inter_spouse_distance) {
                        dx = - ((group_center - random_sibling_group[0].left_parent.x) - random_sibling_group[0].left_parent.dist_to_center_of_children)
                    } else {
                        dx = - ((group_center - random_sibling_group[0].left_parent.x) - MIN_NODE_DX / 2)
                    }
                } else {
                    if(random_sibling_group[0].right_parent.temporary_render_data.has_non_minimum_inter_spouse_distance) {
                        dx = ((random_sibling_group[0].right_parent.x - group_center) - random_sibling_group[0].right_parent.dist_to_center_of_children)
                    } else {
                        dx = ((random_sibling_group[0].right_parent.x - group_center) - MIN_NODE_DX / 2)
                    }
                }

                all_children_across_spouses.forEach(child => {
                    child.all_decendents_across_spouse_chain().forEach(node => {
                        node.x += dx
                    })
                })
            }
        }
        this.log('Done rendering, got x value (local) ' + this.x)
    }

    build_and_render_parent_tree() {
        this.log('Entering build_and_render_parent_tree')
        let parent_tree_root = AbstractFamilyTreeNode.create_unconnected_node()
        this.convert_parent_tree_to_child_tree(parent_tree_root)
        parent_tree_root.render_right_tree()
        parent_tree_root.convert_child_tree_to_parent_tree()
        this.log('Done with build_and_render_parent_tree')
    }

    convert_parent_tree_to_child_tree(new_root_node: AbstractFamilyTreeNode) {
        new_root_node.based_on = this
        if(this.left_parent) {
            let left_child = new_root_node._attach_right_child(AbstractFamilyTreeNode)
            this.left_parent.convert_parent_tree_to_child_tree(left_child)
        }
        if(this.right_parent) {
            let right_child = new_root_node._attach_right_child(AbstractFamilyTreeNode)
            this.right_parent.convert_parent_tree_to_child_tree(right_child)
        }
    }

    convert_child_tree_to_parent_tree() {
        this.based_on.x = this.x
        this.right_children.forEach(child => {
            child.convert_child_tree_to_parent_tree()
        })
    }

    *full_render(): Generator<JSX.Element, undefined, undefined> {
        this.log('** Full render on node')
            
        this.left_parent?.move_to_right_of_siblings()
        this.right_parent?.move_to_left_of_siblings()
    
        let grandparents_rendered = false
        if(this.right_parent && this.right_parent.left_parent) {
            grandparents_rendered = true
    
            this.log('Rendering right parent left parent right tree (--> then <-- grandparent)')
            this.right_parent.left_parent.render_right_tree()
    
            let delta_x = -this.x // should be 0 since we are rendering based on this node, but probably won't be after grandparent render
            this.right_parent.left_parent.all_decendents_across_spouse_chain().forEach(node => {
                node.x += delta_x
            })
        }
        if(this.left_parent && this.left_parent.left_parent) {
            grandparents_rendered = true
    
            this.log('Rendering left parent left parent right tree (<-- then <-- grandparent)')
            this.left_parent.left_parent.render_right_tree()
    
            let delta_x = -this.x // should be 0 since we are rendering based on this node, but probably won't be after grandparent render
            this.left_parent.left_parent.all_decendents_across_spouse_chain().forEach(node => {
                node.x += delta_x
            })
        }

        if(!grandparents_rendered) {
            this.log('Grandparents not rendered!')
            if(this.left_parent) {
                this.left_parent.render_right_tree()

                const delta_x = -this.x
                this.left_parent.all_decendents_across_spouse_chain().forEach(node => {
                    node.x += delta_x
                })
            } else {
                this.render_right_tree()
            }
        }
    
        if(this.right_parent && this.left_parent) {
            this.log('Node has two parents, ensuring parents are rendered')
            this.left_parent.saved_x = this.left_parent._x ?? 0
            this.right_parent.saved_x = this.right_parent._x ?? 0
    
            this.build_and_render_parent_tree()
    
            let dist_between_parents = this.right_parent.x - this.left_parent.x
            let left_aunts = this.left_parent.all_siblings_and_self().map(node => node.saved_x ?? node.x)
            let right_aunts = this.right_parent.all_siblings_and_self().map(node => node.saved_x ?? node.x)
            let center_aunts_left_side = (Math.min(...left_aunts) + Math.max(...left_aunts)) / 2
            let center_aunts_right_side = (Math.min(...right_aunts) + Math.max(...right_aunts)) / 2
            let dist_between_center_of_aunts = center_aunts_right_side - center_aunts_left_side
    
            if(dist_between_center_of_aunts > dist_between_parents) {
                let left_parent_tree_center = this.left_parent.x
                let right_parent_tree_center = this.right_parent.x
                this.left_parent.x = this.left_parent.saved_x
                this.right_parent.x = this.right_parent.saved_x
    
                let dx = center_aunts_left_side - left_parent_tree_center
                this.left_parent.all_parent_nodes().forEach(node => {
                    node.x += dx
                })
    
                dx = center_aunts_right_side - right_parent_tree_center
                this.right_parent.all_parent_nodes().forEach(node => {
                    node.x += dx
                })
    
                delete this.left_parent.saved_x
                delete this.right_parent.saved_x
            } else {
                let left_parent_tree_center = this.left_parent.x
                let right_parent_tree_center = this.right_parent.x
    
                let distance_to_correct_aunts_and_cousins = dist_between_parents - dist_between_center_of_aunts
                let left_aunt_and_cousin_offset = - distance_to_correct_aunts_and_cousins / 2
                let right_aunt_and_cousin_offset = distance_to_correct_aunts_and_cousins / 2
    
                this.left_parent.all_siblings_excluding_self().map(sibling => sibling.all_decendents_across_spouse_chain()).flat().forEach(left_relative => {
                    left_relative.x += left_aunt_and_cousin_offset
                })
    
                this.left_parent.all_decendents_across_spouse_chain_left_until_node_exclusive(this.left_parent).map(left_relative => {
                    left_relative.x += left_aunt_and_cousin_offset
                })
    
                this.right_parent.all_siblings_excluding_self().map(sibling => sibling.all_decendents_across_spouse_chain()).flat().forEach(right_relative => {
                    right_relative.x += right_aunt_and_cousin_offset
                })
    
                this.right_parent.all_decendents_across_spouse_chain_after_node_exclusive_until_end(this.right_parent).map(right_relative => {
                    right_relative.x += right_aunt_and_cousin_offset
                })
    
                this.left_parent.x = this.left_parent.saved_x += left_aunt_and_cousin_offset
                this.right_parent.x = this.right_parent.saved_x += right_aunt_and_cousin_offset
    
                delete this.left_parent.saved_x
                delete this.right_parent.saved_x
    
                let left_aunts = this.left_parent.all_siblings_and_self().map(node => node.x)
                let right_aunts = this.right_parent.all_siblings_and_self().map(node => node.x)
                let new_center_aunts_left_side = (Math.min(...left_aunts) + Math.max(...left_aunts)) / 2
                let new_center_aunts_right_side = (Math.min(...right_aunts) + Math.max(...right_aunts)) / 2
    
                let dx = new_center_aunts_left_side - left_parent_tree_center
                this.left_parent.all_parent_nodes().forEach(node => {
                    node.x += dx
                })
    
                dx = new_center_aunts_right_side - right_parent_tree_center
                this.right_parent.all_parent_nodes().forEach(node => {
                    node.x += dx
                })
            }
        }
    
        for(const node of new Set([
            // next 2 lines get cousins
            ...(this.left_parent?.left_parent?.all_decendents_across_spouse_chain() || []),
            ...(this.right_parent?.left_parent?.all_decendents_across_spouse_chain() || []),
            ...(this.left_parent?.all_decendents_across_spouse_chain() || []), // in case node had no grandparents
            ...this.all_decendents_across_spouse_chain(), // in case node had no parents
            ...this.all_parent_nodes() // TODO: necessary?
        ])) {
            yield* node.draw()
            node.temporary_render_data = {}
        }
    }

    *draw_lines(): Generator<JSX.Element, undefined, never> {
        const divorce_line_width = 25
    
        function relationship_divorced(relationship) {
            const marriage_count = relationship.metadata.filter(node => node.key.toUpperCase() === 'MARRIAGE').length
            const divorce_count = relationship.metadata.filter(node => node.key.toUpperCase() === 'DIVORCE').length
            return divorce_count > 0 && marriage_count === divorce_count
        }
    
        if(this.right_spouse?.is_rendered()) {
            yield <SvgLine
                x1={this.x}
                y1={this.y}
                x2={this.x + (this.right_spouse.x - this.x) / 2}
                y2={this.y}
            />
    
            const spousal_relationship = this.relationship_data.right_spousal_relationship
            if(spousal_relationship && relationship_divorced(spousal_relationship)) {
                yield <SvgLine
                    x1={this.x + (this.right_spouse.x - this.x) / 2 - divorce_line_width / 2}
                    y1={this.y + divorce_line_width / 2}
                    x2={this.x + (this.right_spouse.x - this.x) / 2 + divorce_line_width / 2}
                    y2={this.y - divorce_line_width / 2}
                />
            }
        }
    
        if(this.left_spouse?.is_rendered()) {
            yield <SvgLine
                x1={this.x}
                y1={this.y}
                x2={this.x + (this.left_spouse.x - this.x) / 2}
                y2={this.y}
            />
    
            const spousal_relationship = this.relationship_data.left_spousal_relationship
            if(spousal_relationship && relationship_divorced(spousal_relationship)) {
                yield <SvgLine
                    x1={this.x + (this.left_spouse.x - this.x) / 2 - divorce_line_width / 2}
                    y1={this.y + divorce_line_width / 2}
                    x2={this.x + (this.left_spouse.x - this.x) / 2 + divorce_line_width / 2}
                    y2={this.y - divorce_line_width / 2}
                />
            }
        }

        if(this.treebuilder_skipped_spouses) {
            const line_length = MIN_NODE_DX * 0.75

            if(!this.right_spouse) {
                yield <SvgLine
                    x1={this.x + line_length}
                    y1={this.y}
                    x2={this.x}
                    y2={this.y}
                    incomplete={true}
                />
            } else if(!this.left_spouse) {
                yield <SvgLine
                    x1={this.x - line_length}
                    y1={this.y}
                    x2={this.x}
                    y2={this.y}
                    incomplete={true}
                />
            } else {
                throw new Error('Treebuilder skipped spouses for node that had spouses on both sides - cannot draw lines')
            }
        }

        if(this.treebuilder_skipped_parents || (this.left_parent && !this.left_parent.is_rendered()) || (this.right_parent && !this.right_parent.is_rendered())) {
            const line_length = GENERATION_DY * 0.4

            yield <SvgLine
                x1={this.x}
                y1={this.y - line_length}
                x2={this.x}
                y2={this.y}
                incomplete={true}
            />
        }
        
        let rendered_left_children = this.left_children.filter(child => child.is_rendered())
    
        if(rendered_left_children.length > 0) {
            yield <SvgLine
                x1={center_of_values(rendered_left_children.map(child => child.x))} // TODO: replace other manual min/max averages with center_of_values
                y1={this.y}
                x2={center_of_values(rendered_left_children.map(child => child.x))}
                y2={this.y + GENERATION_DY / 2}
            />
    
            if(rendered_left_children.length > 1) {
                yield <SvgLine
                    x1={Math.min(...rendered_left_children.map(child => child.x))}
                    y1={this.y + GENERATION_DY / 2}
                    x2={Math.max(...rendered_left_children.map(child => child.x))}
                    y2={this.y + GENERATION_DY / 2}
                />
            }
        }
    
        if(this.left_parent?.is_rendered() || this.right_parent?.is_rendered()) {
            yield <SvgLine
                x1={this.x}
                y1={this.y}
                x2={this.x}
                y2={this.y - GENERATION_DY / 2}
            />
        }
    }

    log(string) {
        console.debug(`[${
            this.constructor.name
        }${
            this.data.profile?.name ? `(${this.data.profile.name})` : ''
        }${
            this.based_on ? `:based_on:${
                this.based_on.constructor.name
            }${
                this.based_on.data.profile?.name ? `(${this.based_on.data.profile.name})` : ''
            }` : ''
        }] ${string}`, this)
    }
}
