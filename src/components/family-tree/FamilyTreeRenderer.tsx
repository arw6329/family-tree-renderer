import React, { JSX } from "react"
import "./FamilyTreeRenderer.css"
import "./FamilyTreeRenderer.scoped.css"
import { FamilyTreeDatabase } from "@/lib/family-tree/FamilyTreeDatabase"
import { TreeBuilder } from "@/lib/family-tree/TreeBuilder"
import { ProfileNode } from "@/lib/family-tree/ProfileNode"
import PannableSvg from "../pannable-svg/PannableSvg"
import ControlHeader from "./control-header/ControlHeader"

const FamilyTreeRenderer: React.FC<{ database: FamilyTreeDatabase }> = (props) => {
    const rootNode = ProfileNode.create_unconnected_node({
        profile: Object.values(props.database.profiles)[0]
    })
    const builder = new TreeBuilder(props.database)
    builder.construct_tree(rootNode)
    const elems = [...rootNode.full_render()]

    return (
        <div className="root">
            <ControlHeader />
            <PannableSvg>
                <g>{...elems}</g>
            </PannableSvg>
        </div>
    )
}

export default FamilyTreeRenderer