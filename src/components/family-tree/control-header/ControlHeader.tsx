import HeaderButton from "@/components/header-button/HeaderButton"
import "./ControlHeader.scoped.css"
import { useContext, useState } from "react"
import JumpToProfileOverlay from "@/components/overlays/JumpToProfileOverlay"
import { FamilyTreeStateContext } from "../FamilyTreeState"

interface ControlHeaderProps {
    onRecenter: () => void
    onZoomIn: () => void
    onZoomOut: () => void
}

const ControlHeader: React.FC<ControlHeaderProps> = (props) => {
    const state = useContext(FamilyTreeStateContext)
    const [selectingUser, setSelectingUser] = useState(false)

    return (
        <header>
            <HeaderButton onClick={() => props.onRecenter()}>
                <span>Recenter</span>
            </HeaderButton>
            <HeaderButton onClick={() => setSelectingUser(true)}>
                <span>Jump to person</span>
            </HeaderButton>
            <HeaderButton onClick={() => props.onZoomIn()}>
                <span>Zoom in</span>
            </HeaderButton>
            <HeaderButton onClick={() => props.onZoomOut()}>
                <span>Zoom out</span>
            </HeaderButton>
            {
                state.editing
                ? <HeaderButton onClick={() => state.setEditing(false)}>
                    <span>Exit edit mode</span>
                </HeaderButton>
                : <HeaderButton onClick={() => state.setEditing(true)}>
                    <span>Edit</span>
                </HeaderButton>
            }
            {selectingUser && <JumpToProfileOverlay onFinished={() => setSelectingUser(false)} />}
        </header>
    )
}

export default ControlHeader