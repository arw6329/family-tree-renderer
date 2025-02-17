import MultiSpouseBlock from '@/components/family-tree/multi-spouse-block/MultiSpouseBlock'
import { AbstractFamilyTreeNode } from './AbstractFamilyTreeNode'
import { ProfileNode } from './ProfileNode'
import { JSX } from 'react'

export class MultiSpouseNode extends AbstractFamilyTreeNode {
    static merge_spouses_left(node: AbstractFamilyTreeNode) {
        if(!node.left_spouse || !node.right_spouse) {
            throw new Error('cannot use this function unless node has 2 spouses')
        }

        const current_profiles_left = node.left_spouse instanceof MultiSpouseNode
            ? node.left_spouse.data.profiles
            : node.left_spouse instanceof ProfileNode
            ? [ node.left_spouse.data.profile ]
            : (() => { throw new Error('cannot merge multiple spouses into this kind of node') })()

        const current_profiles_right = node.right_spouse instanceof MultiSpouseNode
            ? node.right_spouse.data.profiles
            : node.right_spouse instanceof ProfileNode
            ? [ node.right_spouse.data.profile ]
            : (() => { throw new Error('cannot merge multiple spouses into this kind of node') })()

        const right_spouse_children = node.right_children

		node.left_spouse.replace_with(MultiSpouseNode.create_unconnected_node({
			profiles: [
				...current_profiles_left,
                ...current_profiles_right
			]
		}))

		node.right_spouse.delete()

		right_spouse_children.forEach(child => {
			child.left_parent = node.left_spouse
			child.right_parent = node
			node.left_children.push(child)
		})

		node.right_children = []
    }

    static merge_spouses_right(node: AbstractFamilyTreeNode) {
        if(!node.left_spouse || !node.right_spouse) {
            throw new Error('cannot use this function unless node has 2 spouses')
        }

        const current_profiles_right = node.right_spouse instanceof MultiSpouseNode
            ? node.right_spouse.data.profiles
            : node.right_spouse instanceof ProfileNode
            ? [ node.right_spouse.data.profile ]
            : (() => { throw new Error('cannot merge multiple spouses into this kind of node') })()

        const current_profiles_left = node.left_spouse instanceof MultiSpouseNode
            ? node.left_spouse.data.profiles
            : node.left_spouse instanceof ProfileNode
            ? [ node.left_spouse.data.profile ]
            : (() => { throw new Error('cannot merge multiple spouses into this kind of node') })()

        const left_spouse_children = node.left_children

		node.right_spouse.replace_with(MultiSpouseNode.create_unconnected_node({
			profiles: [
				...current_profiles_right,
                ...current_profiles_left
			]
		}))

		node.left_spouse.delete()

		left_spouse_children.forEach(child => {
			child.right_parent = node.right_spouse
			child.left_parent = node
			node.right_children.push(child)
		})

		node.left_children = []
    }

    static inject_profile_left(node: AbstractFamilyTreeNode, profile) {
        const current_profiles_left = node.left_spouse instanceof MultiSpouseNode
            ? node.left_spouse.data.profiles
            : node.left_spouse instanceof ProfileNode
            ? [ node.left_spouse.data.profile ]
            : (() => { throw new Error('cannot merge multiple spouses into this kind of node') })()

        node.left_spouse.replace_with(MultiSpouseNode.create_unconnected_node({
            profiles: [
                ...current_profiles_left,
                profile
            ]
        }))

        node.relationship_data.left_spousal_relationship = null
    }

    static inject_profile_right(node: AbstractFamilyTreeNode, profile) {
        const current_profiles_right = node.right_spouse instanceof MultiSpouseNode
            ? node.right_spouse.data.profiles
            : node.right_spouse instanceof ProfileNode
            ? [ node.right_spouse.data.profile ]
            : (() => { throw new Error('cannot merge multiple spouses into this kind of node') })()

        node.right_spouse.replace_with(MultiSpouseNode.create_unconnected_node({
            profiles: [
                ...current_profiles_right,
                profile
            ]
        }))

        node.relationship_data.right_spousal_relationship = null
    }

	*draw(): Generator<JSX.Element, undefined, never> {
        yield* this.draw_lines()
        
        yield <MultiSpouseBlock
            x={this.x}
            y={this.y}
            spouseCount={this.data.profiles.length}
        />
    }

    is_representative_of(profile_id: string) {
        return this.data.profiles.some(profile => profile.profile_id === profile_id)
    }
}