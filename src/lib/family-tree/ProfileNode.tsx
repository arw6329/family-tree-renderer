import { AbstractFamilyTreeNode } from './AbstractFamilyTreeNode'
import { relation_to } from './relation'
import { JSX } from 'react'
import RelationshipInfoButton from '@/components/family-tree/relationship-info-button/RelationshipInfoButton'
import ProfileBlock from '@/components/family-tree/profile-block/ProfileBlock'

export class ProfileNode extends AbstractFamilyTreeNode {
	*draw(): Generator<JSX.Element, undefined, never> {
        if(!this.is_rendered()) {
            throw 'attempted to draw node before it was rendered'
        }

        yield* this.draw_lines()

        if(this.right_spouse && this.right_spouse instanceof ProfileNode) {
            yield <RelationshipInfoButton
                x={(this.x + this.right_spouse.x) / 2}
                y={this.y}
                onClick={() => {
                    // const popout = document.createElement('spousal-relationship-info')

                    // popout.dataset.relationship = JSON.stringify(this.relationship_data.right_spousal_relationship)
                    // popout.dataset.spouse1 = JSON.stringify(this.data.profile)
                    // popout.dataset.spouse2 = JSON.stringify(this.right_spouse.data.profile)
    
                    // document.querySelector('svg').firstElementChild.appendChild(
                    //     NotchedForeignObjectElement(popout, spouse_detail_button)
                    // )
                }}
            />
        }
        
        // if(
        //     this.left_parent instanceof ProfileNode
        //     && this.right_parent instanceof ProfileNode
        //     && this.left_parent.is_rendered()
        //     && this.right_parent.is_rendered()
        // ) {
        //     const unknown_parent_profile = {
        //         name: 'Unknown Person',
        //     }

        //     const child_detail_button = RelationshipInfoButtonElement(this.x, this.y - AbstractFamilyTreeNode.GENERATION_DY / 2)
            
        //     child_detail_button.firstElementChild.addEventListener('click', evt => {
        //         const popout = document.createElement('child-relationship-info')

        //         popout.dataset.relationship = JSON.stringify(this.relationship_data.own_child_relationship)
        //         popout.dataset.parent2 = JSON.stringify(this.left_parent?.data.profile ?? unknown_parent_profile)
        //         popout.dataset.parent1 = JSON.stringify(this.right_parent?.data.profile ?? unknown_parent_profile)
        //         popout.dataset.child = JSON.stringify(this.data.profile)

        //         document.querySelector('svg').firstElementChild.appendChild(
        //             NotchedForeignObjectElement(popout, child_detail_button)
        //         )
        //     })
            
        //     yield child_detail_button
        // }
        
        // let container = FamilyTreeNodeElement(this.x, this.y, this.data.profile, AbstractFamilyTreeNode.get_anchor_node().data.profile, relation_to(this, AbstractFamilyTreeNode.get_anchor_node()))
        // document.querySelector('svg').firstElementChild.appendChild(container)
        // container.firstElementChild.node = this

        // if(AbstractFamilyTreeNode.get_anchor_node() === this) {
        //     container.firstElementChild.classList.add('anchored')
        // }

        // container.firstElementChild.addEventListener('dblclick', async evt => {
        //     await reconstruct(this.constructor.create_unconnected_node(this.data), false)
        // })

        yield <ProfileBlock
            x={this.x}
            y={this.y}
            node={this}
        />
    }

    is_representative_of(profile_id: string): boolean {
        return this.data.profile.profile_id === profile_id
    }
}