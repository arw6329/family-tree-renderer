import { AbstractFamilyTreeNode } from './AbstractFamilyTreeNode'
import { JSX } from 'react'
import AddSpouseButton from '@/components/family-tree/add-spouse-button/AddSpouseButton'

export class AddSpouseButtonNode extends AbstractFamilyTreeNode {
	*draw(): Generator<JSX.Element, undefined, undefined> {
        if(!this.is_rendered()) {
            throw 'attempted to draw node before it was rendered'
        }

        yield* this.draw_lines()

        const spouseProfile = this.left_spouse?.data.profile ?? this.right_spouse.data.profile
        yield <AddSpouseButton
            x={this.x}
            y={this.y}
            withProfile={spouseProfile}
        />
    }

    is_representative_of(profile_id: string): boolean {
        return false
    }
}