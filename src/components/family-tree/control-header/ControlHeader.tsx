import HeaderButton from "@/components/header-button/HeaderButton"
import "./ControlHeader.scoped.css"
import { useState } from "react"
import JumpToProfileOverlay from "@/components/overlays/JumpToProfileOverlay"

interface ControlHeaderProps {
    onRecenter: () => void
    onZoomIn: () => void
    onZoomOut: () => void
    onStartEdit: () => void
}

const ControlHeader: React.FC<ControlHeaderProps> = (props) => {
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
            <HeaderButton onClick={() => props.onStartEdit()}>
                <span>Edit</span>
            </HeaderButton>
            {selectingUser && <JumpToProfileOverlay onFinished={() => setSelectingUser(false)} />}
        </header>
    )
}

export default ControlHeader