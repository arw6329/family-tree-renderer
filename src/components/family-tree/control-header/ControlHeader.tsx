import HeaderButton from "@/components/header-button/HeaderButton"
import "./ControlHeader.scoped.css"

interface ControlHeaderProps {
    onRecenter: () => void
    onZoomIn: () => void
    onZoomOut: () => void
    onStartEdit: () => void
}

const ControlHeader: React.FC<ControlHeaderProps> = (props) => {
    return (
        <header>
            <HeaderButton onClick={() => props.onRecenter()}>
                <span>Recenter</span>
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
        </header>
    )
}

export default ControlHeader