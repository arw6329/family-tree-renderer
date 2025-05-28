import { AbstractFamilyTreeNode } from './AbstractFamilyTreeNode'
import { JSX } from 'react'
import ProfileBlock from '@/components/family-tree/profile-block/ProfileBlock'
import SpousalRelationshipInfoButton from '@/components/family-tree/relationship-info-button/SpousalRelationshipInfoButton'
import ChildRelationshipInfoButton from '@/components/family-tree/relationship-info-button/ChildRelationshipInfoButton'
import { getPedigree } from './metadata-helpers'
import ChildRelationshipLabel from '@/components/family-tree/child-relationship-label/ChildRelationshipLabel'

export class ProfileNode extends AbstractFamilyTreeNode {
	*draw(horizontal: boolean): Generator<JSX.Element, undefined, never> {
        if(!this.is_rendered()) {
            throw 'attempted to draw node before it was rendered'
        }

        if(
            this.left_parent instanceof ProfileNode
            && this.right_parent instanceof ProfileNode
            && this.left_parent.is_rendered()
            && this.right_parent.is_rendered()
        ) {
            const childRelationshipId = this.relationship_data.own_child_relationship!.relationship_id

            if(horizontal) {
                yield <ChildRelationshipInfoButton
                    x={(this.y + this.left_parent.y) / 2}
                    y={this.x}
                    relationship={this.relationship_data.own_child_relationship!}
                    key={this.key() + '--' + childRelationshipId}
                />
            } else {
                yield <ChildRelationshipInfoButton
                    x={this.x}
                    y={(this.y + this.left_parent.y) / 2}
                    relationship={this.relationship_data.own_child_relationship!}
                    key={this.key() + '--' + childRelationshipId}
                />
            }

            const pedigree = getPedigree(this.relationship_data.own_child_relationship!.metadata)
            if(pedigree === 'adoptive' || pedigree === 'foster') {
                if(horizontal) {
                    yield <ChildRelationshipLabel
                        x={(this.y + this.left_parent.y) / 2 + (this.y - this.left_parent.y) / 5.5}
                        y={this.x}
                        labelText={pedigree.toUpperCase()}
                        key={this.key() + `--crlabel-${childRelationshipId}`}
                    />
                } else {
                    yield <ChildRelationshipLabel
                        x={this.x}
                        y={(this.y + this.left_parent.y) / 2 + (this.y - this.left_parent.y) / 5.5}
                        labelText={pedigree.toUpperCase()}
                        key={this.key() + `--crlabel-${childRelationshipId}`}
                    />
                }
            }
        }

        // This needs to be before right SpousalRelationshipInfoButton for tab order
        if(horizontal) {
            yield <ProfileBlock
                x={this.y}
                y={this.x}
                node={this}
                key={this.key()}
            />
        } else {
            yield <ProfileBlock
                x={this.x}
                y={this.y}
                node={this}
                key={this.key()}
            />
        }

        if(this.right_spouse && this.right_spouse instanceof ProfileNode) {
            if(horizontal) {
                yield <SpousalRelationshipInfoButton
                    x={this.y}
                    y={(this.x + this.right_spouse.x) / 2}
                    relationship={this.relationship_data.right_spousal_relationship!}
                    key={this.key() + '--' + this.relationship_data.right_spousal_relationship!.relationship_id}
                />
            } else {
                yield <SpousalRelationshipInfoButton
                    x={(this.x + this.right_spouse.x) / 2}
                    y={this.y}
                    relationship={this.relationship_data.right_spousal_relationship!}
                    key={this.key() + '--' + this.relationship_data.right_spousal_relationship!.relationship_id}
                />
            }
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