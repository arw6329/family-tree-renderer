import React, { useEffect, useRef } from "react"
import "./FamilyTreeRenderer.css"
import "./FamilyTreeRenderer.scoped.css"
import { FamilyTreeDatabase } from "@/lib/family-tree/FamilyTreeDatabase"
import { TreeBuilder } from "@/lib/family-tree/TreeBuilder"
import { ProfileNode } from "@/lib/family-tree/ProfileNode"
import PannableSvg from "../pannable-svg/PannableSvg"
import ControlHeader from "./control-header/ControlHeader"

const FamilyTreeRenderer: React.FC<{ database: FamilyTreeDatabase }> = (props) => {
    const pannableSvg = useRef(null)

    const rootNode = ProfileNode.create_unconnected_node({
        profile: Object.values(props.database.profiles)[0]
    })

    const builder = new TreeBuilder(props.database)
    builder.construct_tree(rootNode)
    const elems = [...rootNode.full_render()]

    useEffect(() => {
        pannableSvg.current.setCenter(rootNode.x, rootNode.y)
    }, [pannableSvg])

    return (
        <div className="root">
            <ControlHeader
                onRecenter={() => pannableSvg.current.setCenter(rootNode.x, rootNode.y)}
            />
            <PannableSvg ref={pannableSvg}>
                <g>{...elems}</g>
            </PannableSvg>
        </div>
    )
}

export default FamilyTreeRenderer