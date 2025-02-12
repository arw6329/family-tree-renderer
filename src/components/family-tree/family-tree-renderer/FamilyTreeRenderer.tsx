import React, { useContext, useEffect, useMemo, useRef } from "react"
import "./FamilyTreeRenderer.css"
import "./FamilyTreeRenderer.scoped.css"
import { FamilyTreeDatabase } from "@/lib/family-tree/FamilyTreeDatabase"
import { TreeBuilder } from "@/lib/family-tree/TreeBuilder"
import { ProfileNode } from "@/lib/family-tree/ProfileNode"
import PannableSvg from "../../pannable-svg/PannableSvg"
import ControlHeader from "../control-header/ControlHeader"
import ProfileHeader from "../profile-header/ProfileHeader"
import { FamilyTreeStateContext, FamilyTreeStateProvider } from "../FamilyTreeState"

const FamilyTreeRenderer: React.FC<{}> = (props) => {
    const pannableSvg = useRef(null)

    const state = useContext(FamilyTreeStateContext)

    useEffect(() => {
        pannableSvg.current.setCenter(state.rootNode.x, state.rootNode.y)
    }, [state.rootNode.data.profile, pannableSvg])

    const renderedElements = useMemo(() => {
        // Full render is expensive
        // Cache rendered elements so we don't have to do it every rerender of this component
        return [...state.rootNode.full_render()]
    }, [state.rootNode, state.editing])

    return (
        <div className="root">
            <ControlHeader
                onRecenter={() => pannableSvg.current.setCenter(state.rootNode.x, state.rootNode.y)}
                onZoomIn={() => pannableSvg.current.zoom(-500)}
                onZoomOut={() => pannableSvg.current.zoom(500)}
                onStartEdit={() => state.setEditing(true)} // TODO: move to ControlHeader since it also accesses state?
            />
            {state.focusedProfileNode && <ProfileHeader node={state.focusedProfileNode}/>}
            <PannableSvg ref={pannableSvg}>
                <g>{renderedElements}</g>
            </PannableSvg>
        </div>
    )
}

export default FamilyTreeRenderer