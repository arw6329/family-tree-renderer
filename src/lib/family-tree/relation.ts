import { min_by_with_index } from "../array-utils/array-utils"
import { AbstractFamilyTreeNode } from "./AbstractFamilyTreeNode"

const SELF = 0
const PARENT = 1
const CHILD = 2
const NIECE = 3
const AUNT = 4
const SIBLING = 5
const COUSIN = 6
const SPOUSE = 7

function num_to_text_ord(n: number) {
	return '' + n + (n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th')
}

class Relation {
	public path: AbstractFamilyTreeNode[] = []
	private is_related = false
	private no_further_propagate = false
	private no_further_spouse_propagate = false
	private type = SELF
	private generation_offset = 0
	private cousin_level = 0
	private cousin_removal = 0
	public by_marriage = false
	private step = false
	private inlaw = false
	private half = false

	copy() {
		let copy = new Relation()
		copy.path = [...this.path]
		copy.is_related = this.is_related
		copy.no_further_propagate = this.no_further_propagate
		copy.no_further_spouse_propagate = this.no_further_spouse_propagate
		copy.type = this.type
		copy.generation_offset = this.generation_offset
		copy.cousin_level = this.cousin_level
		copy.cousin_removal = this.cousin_removal
		copy.by_marriage = this.by_marriage
		copy.step = this.step
		copy.inlaw = this.inlaw
		copy.half = this.half
		return copy
	}

	to_text() {
		switch(this.type) {
			case SELF:
				return 'self'
			case PARENT:
				return (this.step ? 'possible step' : '') + (this.half ? 'half ' : '') + (this.generation_offset > 1 ? 'great-'.repeat(Math.max(this.generation_offset - 2, 0)) + 'grandparent' : 'parent') + (this.inlaw ? '-in-law' : '')
			case CHILD:
				return (this.step ? 'possible step' : '') + (this.half ? 'half ' : '') + (this.generation_offset < -1 ? 'great-'.repeat(Math.max(-this.generation_offset - 2, 0)) + 'grandchild' : 'child') + (this.inlaw ? '-in-law' : '')
			case NIECE:
				return (this.step ? 'possible step' : '') + (this.half ? 'half ' : '') + (this.generation_offset < -1 ? 'great-'.repeat(Math.max(-this.generation_offset - 2, 0)) + 'grandniece or nephew' : 'niece or nephew') + (this.inlaw ? '-in-law' : '')
			case AUNT:
				return (this.step ? 'possible step' : '') + (this.half ? 'half ' : '') + (this.generation_offset > 1 ? 'great-'.repeat(Math.max(this.generation_offset - 2, 0)) + 'grandaunt or uncle' : 'aunt or uncle') + (this.inlaw ? '-in-law' : '')
			case SIBLING:
				return (this.step ? 'possible step' : '') + (this.half ? 'half ' : '') + 'sibling' + (this.inlaw ? '-in-law' : '')
			case COUSIN:
				return (this.step ? 'possible step' : '') + (this.half ? 'half ' : '') + (num_to_text_ord(this.cousin_level) + ' cousin' + (this.cousin_removal !== 0 ? ' ' + this.cousin_removal + '-times removed' : '')) + (this.inlaw ? '-in-law' : '')
			case SPOUSE:
				return 'spouse'
			default:
				return 'unknown'
		}
	}

	// generation of source is 0
	// earlier generations are higher in value and positive, later ones are negative
	move_to(connection_type, next_node) {
		this.path.push(next_node)
		switch(connection_type) {
			case PARENT:
				this.no_further_spouse_propagate = false
				switch(this.type) {
					case SELF:
					case PARENT:
						this.type = PARENT
						this.generation_offset++
						break
					case CHILD:
						this.generation_offset++
						if(this.generation_offset === 0)
							this.type = SELF
						break
					case NIECE:
						this.generation_offset++
						if(this.generation_offset === 0)
							this.type = SIBLING
						break
					case AUNT:
						this.generation_offset++
						this.type = PARENT
						break
					case SIBLING:
						this.generation_offset = 1
						this.type = PARENT
						break
					case COUSIN:
						if(this.cousin_level == 1 && this.generation_offset == this.cousin_removal) {
							this.generation_offset++
							this.type = AUNT
						} else if(this.generation_offset < 0) {
							this.generation_offset++
							this.cousin_removal--
						} else {
							this.generation_offset++
							this.cousin_level--
							this.cousin_removal++
						}	
						break
					case SPOUSE:
						this.generation_offset++
						this.type = PARENT
						this.by_marriage = true
						if(!this.step) {
							this.inlaw = true
						}
						break
					default:
						throw new Error('Cannot figure out relationship')
				}
				break
			case CHILD:
				this.no_further_spouse_propagate = false
				switch(this.type) {
					case SELF:
					case CHILD:
						this.type = CHILD
						this.generation_offset--
						break
					case PARENT:
						if(this.generation_offset > 1) {
							this.type = AUNT
						} else {
							this.type = SIBLING
						}
						this.generation_offset--
						break
					case NIECE:
						this.generation_offset--
						break
					case AUNT:
						this.generation_offset--
						this.type = COUSIN
						this.cousin_level = 1
						this.cousin_removal = Math.abs(this.generation_offset)
						break
					case SIBLING:
						this.generation_offset--
						this.type = NIECE
						break
					case COUSIN:
						if(this.generation_offset > 0) {
							this.generation_offset--
							this.cousin_level++
							this.cousin_removal--
						} else {
							this.generation_offset--
							this.cousin_removal++
						}	
						break
					case SPOUSE:
						this.generation_offset--
						this.type = CHILD
						this.by_marriage = true
						this.step = true
						break
					default:
						throw new Error('Cannot figure out relationship')
				}
				break
			case SPOUSE:
				this.by_marriage = true
				switch(this.type) {
					case SELF:
						this.type = SPOUSE
						this.no_further_spouse_propagate = true
						break
					case CHILD:
					case NIECE:
					case SIBLING:
					case AUNT:
					case COUSIN:
						if(this.inlaw) {
							this.inlaw = false
						} else {
							this.inlaw = true
							this.no_further_propagate = true
						}
						break
					case PARENT:
						this.step = true
						this.no_further_spouse_propagate = true
						break
					case SPOUSE:
						this.no_further_spouse_propagate = true
						break
					default:
						throw new Error('Cannot figure out relationship')
				}
				break
			default:
				throw new Error('Unknown connection type when calculating relationship: ' + connection_type)
		}
	}
}

export function relation_to(dest_node: AbstractFamilyTreeNode, source_node: AbstractFamilyTreeNode) {
	let checked_nodes = new Set()
	
	let check_queue: AbstractFamilyTreeNode[] = []

	const log_prefix = '[' + source_node.data.profile.name + ' to ' + dest_node.data.profile.name + ']'

	function get_relation_to_recursive(source: AbstractFamilyTreeNode, dest: AbstractFamilyTreeNode, relation: Relation): Relation | null {
		if(checked_nodes.has(source)) {
			// TODO: is this ever possible?
			return null
		}

		checked_nodes.add(source)

		if(source == dest) {
			relation.is_related = true  // TODO: remove unnecessary is_related param

			const [common_ancestor, i] = min_by_with_index(relation.path, node => node.generation)

			if(
				i > 0 && i < relation.path.length - 1 && (
					relation.path[i - 1].left_parent === relation.path[i + 1].right_parent
					|| relation.path[i - 1].right_parent === relation.path[i + 1].left_parent
				)
			) {
				relation.half = true
			}
			
			return relation
		}

		if(source.relation?.no_further_spouse_propagate) {
			if(source.left_spouse) {
				checked_nodes.add(source.left_spouse)
			}

			if(source.right_spouse) {
				checked_nodes.add(source.right_spouse)
			}
		}

		if(!source.relation?.no_further_propagate) {
			source.children().forEach(child => {
				if(!checked_nodes.has(child) && !check_queue.includes(child)) {
					let new_relation = relation.copy()
					new_relation.move_to(CHILD, child)
					child.relation = new_relation  // TODO: better way of storing this
					check_queue.push(child)
				}
			})
			if(source.left_parent && !checked_nodes.has(source.left_parent) && !check_queue.includes(source.left_parent)) {
				let new_relation = relation.copy()
				new_relation.move_to(PARENT, source.left_parent)
				source.left_parent.relation = new_relation  // TODO: better way of storing this
				check_queue.push(source.left_parent)
			}

			if(source.right_parent && !checked_nodes.has(source.right_parent) && !check_queue.includes(source.right_parent)) {
				let new_relation = relation.copy()
				new_relation.move_to(PARENT, source.right_parent)
				source.right_parent.relation = new_relation  // TODO: better way of storing this
				check_queue.push(source.right_parent)
			}

			if(!source.relation?.no_further_spouse_propagate) {
				if(source.left_spouse && !checked_nodes.has(source.left_spouse) && !check_queue.includes(source.left_spouse)) {
					let new_relation = relation.copy()
					new_relation.move_to(SPOUSE, source.left_spouse)
					source.left_spouse.relation = new_relation  // TODO: better way of storing this
					check_queue.push(source.left_spouse)
				}
	
				if(source.right_spouse && !checked_nodes.has(source.right_spouse) && !check_queue.includes(source.right_spouse)) {
					let new_relation = relation.copy()
					new_relation.move_to(SPOUSE, source.right_spouse)
					source.right_spouse.relation = new_relation  // TODO: better way of storing this
					check_queue.push(source.right_spouse)
				}
			}
		}

		let next = check_queue.shift()
		
		if(next) {
			let next_relation = get_relation_to_recursive(next, dest, next.relation)
			// next.relation = undefined
			if(next_relation) {
				return next_relation
			}
		}

		return null
	}

	const start = new Relation()
	start.path.push(source_node)
    const relation = get_relation_to_recursive(source_node, dest_node, start)
    if(relation) {
        return {
            by_marriage: relation.by_marriage,
            text: relation.to_text()
        }
    } else {
        return null
    }
}