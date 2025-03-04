import { AbstractFamilyTreeNode } from './AbstractFamilyTreeNode'
import { JSX } from 'react'
import ProfileBlock from '@/components/family-tree/profile-block/ProfileBlock'
import SpousalRelationshipInfoButton from '@/components/family-tree/relationship-info-button/SpousalRelationshipInfoButton'
import ChildRelationshipInfoButton from '@/components/family-tree/relationship-info-button/ChildRelationshipInfoButton'
import { getPedigree } from './metadata-helpers'
import ChildRelationshipLabel from '@/components/family-tree/child-relationship-label/ChildRelationshipLabel'

export class ProfileNode extends AbstractFamilyTreeNode {
	*draw(): Generator<JSX.Element, undefined, never> {
        if(!this.is_rendered()) {
            throw 'attempted to draw node before it was rendered'
        }

        if(
            this.left_parent instanceof ProfileNode
            && this.right_parent instanceof ProfileNode
            && this.left_parent.is_rendered()
            && this.right_parent.is_rendered()
        ) {
            yield <ChildRelationshipInfoButton
                x={this.x}
                y={(this.y + this.left_parent.y) / 2}
                relationship={this.relationship_data.own_child_relationship!}
            />

            const pedigree = getPedigree(this.relationship_data.own_child_relationship!.metadata)
            switch(pedigree) {
                case 'adoptive': {
                    yield <ChildRelationshipLabel
                        x={this.x}
                        y={(this.y + this.left_parent.y) / 2 + (this.y - this.left_parent.y) / 5.5}
                        labelText='ADOPTIVE'
                    />
                }
            }
        }

        // This needs to be before right SpousalRelationshipInfoButton for tab order
        yield <ProfileBlock
            x={this.x}
            y={this.y}
            node={this}
        />

        if(this.right_spouse && this.right_spouse instanceof ProfileNode) {
            yield <SpousalRelationshipInfoButton
                x={(this.x + this.right_spouse.x) / 2}
                y={this.y}
                relationship={this.relationship_data.right_spousal_relationship!}
            />
        }
        
        // let container = FamilyTreeNodeElement(this.x, this.y, this.data.profile, AbstractFamilyTreeNode.get_anchor_node().data.profile, relation_to(this, AbstractFamilyTreeNode.get_anchor_node()))
        // document.querySelector('svg').firstElementChild.appendChild(container)
        // container.firstElementChild.node = this

        // if(AbstractFamilyTreeNode.get_anchor_node() === this) {
        //     container.firstElementChild.classList.add('anchored')
        // }

        // container.firstElementChild.addEventListener('dblclick', async evt => {
        //     await reconstruct(this.constructor.create_unconnected_node(this.data), false)
        // })
    }

    is_representative_of(profile_id: string): boolean {
        return this.data.profile.profile_id === profile_id
    }
}