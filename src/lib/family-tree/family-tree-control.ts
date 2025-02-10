import { AbstractFamilyTreeNode } from './AbstractFamilyTreeNode'
import { CreateNewNodeButtonNode, AddChildButtonNode, AddParentButtonNode, AddSpouseButtonNode } from '/js/family-tree/add-button-nodes.js'
import { relation_to } from './relation'
import { TreeBuilder } from './TreeBuilder'
import { ProfileNode } from './ProfileNode'
import { MultiSpouseNode } from './MultiSpouseNode'
import { FamilyTreeIslandFinder } from '/js/family-tree/island-finder.js'

let cached_db = null

export function recenter_anchor() {
	const svg = document.querySelector('.family-tree-svg')
	const viewBox = svg.getAttribute('viewBox').split(' ').map(num => parseFloat(num))
	const anchor = document.querySelector('.family-tree-node.anchored').closest('foreignObject')
	viewBox[0] = anchor.x.baseVal.value - (viewBox[2] - anchor.width.baseVal.value) / 2
	viewBox[1] = anchor.y.baseVal.value - (viewBox[3] - anchor.height.baseVal.value) / 2
	svg.setAttribute('viewBox', viewBox.join(' '))
}

export async function reconstruct(anchor, refetch_database = true) {
	let database = cached_db

	if(refetch_database) {
		document.querySelector('.tree-loading-banner').classList.remove('hidden')

		const result = await fetch_json('/api/family-tree/fetch')

		if(!result.success) {
			error_banner('There was an error fetching the family tree from the server', result.error)
			throw new Error('Error while fetching family tree from server')
		}

		database = result.database
	}

	if(database === null) {
		throw new Error('refetch_database was false and no cached database available')
	}

	cached_db = database

	if(anchor === null) {
		// TODO: factory function for creating lone nodes instead of this in multiple places
		anchor = ProfileNode.create_unconnected_node({
			profile: Object.values(database.profiles).find(profile => profile.own)
		})
	}

	window.tree_builder = new TreeBuilder(database)

	window.tree_builder.construct_tree(anchor)
	
	anchor.full_render()

	if(document.querySelector('.family-tree-svg').classList.contains('edit-mode')) {
		enter_edit_mode()
	}

	document.querySelector('.tree-loading-banner').classList.add('hidden')
}

export async function reconstruct_same_anchor(refetch_database = true) {
	await reconstruct(ProfileNode.create_unconnected_node({
		profile: AbstractFamilyTreeNode.get_anchor_node().data.profile
	}), refetch_database)
}

export function load_database_and_reconstruct(database) {
	cached_db = database

	window.islands = [...new FamilyTreeIslandFinder(database).find_islands()]

	const anchor = ProfileNode.create_unconnected_node({
		profile: Object.values(database.profiles)[0]
	})

	reconstruct(anchor, false)
}

export function suggest_profiles_from_database(str) {
	const limit = 4

	const wildcardify = string => {
		return new RegExp('.*' + string.trim().split(/\s+/g).map(piece => piece.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '.*', 'i')
	}

	const regex = wildcardify(str)

	let found_profiles = 0

	return Object.values(cached_db.profiles).filter(profile => {
		if(found_profiles < limit && regex.test(profile.name.replaceAll(/\s+/g, ''))) {
			found_profiles++
			return true
		}
		return false
	})
}

// TODO: refactor everything to live inside AbstractFamilyTreeNode class
export function enter_edit_mode() {
	const anchor = AbstractFamilyTreeNode.get_anchor_node()

	if(!anchor.right_spouse) {
		anchor._attach_right_spouse(AddSpouseButtonNode)
	} else if(!anchor.left_spouse) {
		anchor._attach_left_spouse(AddSpouseButtonNode)
	} else {
		MultiSpouseNode.merge_spouses_left(anchor)

		anchor._attach_right_spouse(AddSpouseButtonNode)
		
		// TODO: only really need to unrender the deleted spouse - fix to be more efficient??
		anchor.full_render()
	}

	AbstractFamilyTreeNode.get_all_drawn_nodes().forEach(node => {
		if(!(node instanceof ProfileNode)) {
			return
		}

		if(node.right_spouse && node.right_spouse instanceof ProfileNode && !node.right_add_child_button_attached) {
			node._attach_right_child(AddChildButtonNode)
			node.right_add_child_button_attached = true
			node.right_spouse.left_add_child_button_attached = true
		}
		if(node.left_spouse && node.left_spouse instanceof ProfileNode && !node.left_add_child_button_attached) {
			node._attach_left_child(AddChildButtonNode)
			node.left_add_child_button_attached = true
			node.left_spouse.right_add_child_button_attached = true
		}

        if(!node.has_parent() && relation_to(node, anchor)?.by_marriage === false) {
            node._attach_left_parent(AddParentButtonNode)
            node._attach_right_parent(AddParentButtonNode)
        }
	})

	AbstractFamilyTreeNode.get_all_drawn_nodes().forEach(node => {
		delete node.left_add_child_button_attached
		delete node.right_add_child_button_attached
	})

	// TODO: replace all calls to full_render with reconstruct???
	anchor.full_render()

    document.querySelector('.edit-mode-viewport-controls-tray').classList.add('enabled')
    document.querySelector('.enter-edit-mode-button').classList.remove('enabled')

	document.querySelector('svg').classList.add('edit-mode')
}

export function exit_edit_mode() {
	AbstractFamilyTreeNode.get_all_drawn_nodes().forEach(node => {
		if(node instanceof CreateNewNodeButtonNode) {
			node.delete()
		}
	})

	AbstractFamilyTreeNode.get_anchor_node().full_render()

	document.querySelector('.edit-mode-viewport-controls-tray').classList.remove('enabled')
    document.querySelector('.enter-edit-mode-button').classList.add('enabled')

	document.querySelector('svg').classList.remove('edit-mode')
}

export function sync_profile(profile) {
	if(!cached_db.profiles[profile.profile_id]) {
		cached_db.profiles[profile.profile_id] = profile
	} else {
		Object.entries(profile).forEach(([key, value]) => {
			cached_db.profiles[profile.profile_id][key] = value
		})
	}
}

export function create_spousal_relationship(relationship) {
	cached_db.spousal_relationships[relationship.relationship_id] = relationship
}

export function create_child_relationship(relationship) {
	cached_db.child_relationships[relationship.relationship_id] = relationship
}

export function update_spousal_relationship(relationship_id, relationship_data) {
	Object.entries(relationship_data).forEach(([key, value]) => {
		cached_db.spousal_relationships[relationship_id][key] = value
	})
}

export function update_child_relationship(relationship_id, relationship_data) {
	Object.entries(relationship_data).forEach(([key, value]) => {
		cached_db.child_relationships[relationship_id][key] = value
	})
}

export function delete_spousal_relationship(relationship_id) {
	Object.entries(cached_db.child_relationships)
		.filter(c_relation => c_relation.parent_relationship_id === relationship_id)
		.forEach(c_relation => {
			delete cached_db.child_relationships[c_relation.relationship_id]
		})
	
	delete cached_db.spousal_relationships[relationship_id]
}

export function delete_child_relationship(relationship_id) {
	delete cached_db.child_relationships[relationship_id]
}