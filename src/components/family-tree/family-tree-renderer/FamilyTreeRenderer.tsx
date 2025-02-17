import React, { useContext, useEffect, useMemo, useRef } from "react"
import "./FamilyTreeRenderer.css"
import "./FamilyTreeRenderer.scoped.css"
import PannableSvg from "../../pannable-svg/PannableSvg"
import ControlHeader from "../control-header/ControlHeader"
import ProfileHeader from "../profile-header/ProfileHeader"
import { FamilyTreeStateContext } from "../FamilyTreeState"

const FamilyTreeRenderer: React.FC<{}> = (props) => {
    const pannableSvg = useRef(null)

    const state = useContext(FamilyTreeStateContext)

    useEffect(() => {
        pannableSvg.current.setCenter(state.rootNode.x, state.rootNode.y)
    }, [state.rootNode.data.profile])

    const renderedElements = useMemo(() => {
        // Full render is expensive
        // Cache rendered elements so we don't have to do it every rerender of this component
        return [...state.rootNode.full_render()]
    }, [state.rootNode, state.editing])

    const focusedNode = useMemo(() => {
        if(state.focusedProfileId === null) {
            return null
        }

        return state.getNodesBy((node) => {
            return node.is_representative_of(state.focusedProfileId as string)
        })[0]
    }, [state, state.rootNode, state.focusedProfileId])

    return (
        <div className="root">
            <ControlHeader
                onRecenter={() => pannableSvg.current.setCenter(state.rootNode.x, state.rootNode.y)}
                onZoomIn={() => pannableSvg.current.zoom(-500)}
                onZoomOut={() => pannableSvg.current.zoom(500)}
            />
            <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', width: '100%' }}>
                    {state.editing && <div className="under-construction-bar" />}
                    {focusedNode && <ProfileHeader node={focusedNode}/>}
                </div>
            </div>
            <PannableSvg ref={pannableSvg}>
                <g>{renderedElements}</g>
            </PannableSvg>
        </div>
    )
}

export default FamilyTreeRenderer