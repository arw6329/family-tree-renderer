import { AbstractFamilyTreeNode } from './AbstractFamilyTreeNode'
import { JSX } from 'react'
import AddSpouseButton from '@/components/family-tree/add-spouse-button/AddSpouseButton'

export class AddSpouseButtonNode extends AbstractFamilyTreeNode {
	*draw(horizontal: boolean): Generator<JSX.Element, undefined, undefined> {
        if(!this.is_rendered()) {
            throw 'attempted to draw node before it was rendered'
        }

        const spouseProfile = this.left_spouse?.data.profile ?? this.right_spouse.data.profile
        yield <AddSpouseButton
            x={horizontal ? this.y : this.x}
            y={horizontal ? this.x : this.y}
            withProfile={spouseProfile}
            key={this.key()}
        />
    }

    is_representative_of(profile_id: string): boolean {
        return false
    }
}