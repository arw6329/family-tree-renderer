import HeaderButton from "@/components/header-button/HeaderButton"
import "./ControlHeader.scoped.css"

interface ControlHeaderProps {
    onRecenter: () => void
}

const ControlHeader: React.FC<ControlHeaderProps> = (props) => {
    return (
        <header>
            <HeaderButton onClick={() => props.onRecenter()}>
                <span>Recenter</span>
            </HeaderButton>
            <HeaderButton>
                <span>Zoom in</span>
            </HeaderButton>
            <HeaderButton>
                <span>Zoom out</span>
            </HeaderButton>
            <HeaderButton>
                <span>Edit</span>
            </HeaderButton>
        </header>
    )
}

export default ControlHeader