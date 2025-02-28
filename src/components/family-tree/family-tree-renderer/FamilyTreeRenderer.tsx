import React, { KeyboardEvent, useContext, useEffect, useMemo, useRef, useState } from "react"
import "./FamilyTreeRenderer.css"
import "./FamilyTreeRenderer.scoped.css"
import PannableSvg from "../../pannable-svg/PannableSvg"
import ControlHeader from "../control-header/ControlHeader"
import ProfileHeader from "../profile-header/ProfileHeader"
import { FamilyTreeStateContext } from "../FamilyTreeState"
import SpousalRelationshipHeader from "../spousal-relationship-header/SpousalRelationshipHeader"
import KeyShortcutInfo from "@/components/key-shortcut-info/KeyShortcutInfo"

const FamilyTreeRenderer: React.FC<{}> = (props) => {
    const root = useRef(null)
    const pannableSvg = useRef(null)
    const state = useContext(FamilyTreeStateContext)
    const [keyShortcutMenuOpen, setKeyShortcutMenuOpen] = useState(false)

    function handleKeyDown(event: KeyboardEvent) {
        if(event.altKey && event.shiftKey && event.code === 'KeyK') {
            setKeyShortcutMenuOpen(!keyShortcutMenuOpen)
        } else if(event.altKey && event.shiftKey && event.code === 'KeyA') {
            pannableSvg.current.setCenter(state.rootNode.x, state.rootNode.y)
            // TODO: querySelector is less than ideal here..
            root.current.querySelector('[data-anchor=true]').parentElement.focus()
        }
    }

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
        <div className="root" ref={root} onKeyDown={handleKeyDown}>
            <ControlHeader
                onRecenter={() => pannableSvg.current.setCenter(state.rootNode.x, state.rootNode.y)}
                onZoomIn={() => pannableSvg.current.zoom(-500)}
                onZoomOut={() => pannableSvg.current.zoom(500)}
            />
            <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', width: '100%' }}>
                    {state.editing && <div className="under-construction-bar" />}
                    {focusedNode && <ProfileHeader node={focusedNode}/>}
                    {state.focusedSpousalRelationshipId && <SpousalRelationshipHeader />}
                    {keyShortcutMenuOpen && <KeyShortcutInfo />}
                </div>
            </div>
            <PannableSvg ref={pannableSvg}>
                <g>{renderedElements}</g>
            </PannableSvg>
        </div>
    )
}

export default FamilyTreeRenderer