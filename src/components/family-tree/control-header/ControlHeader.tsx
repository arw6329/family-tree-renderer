import HeaderButton from "@/components/header-button/HeaderButton"
import "./ControlHeader.scoped.css"

interface ControlHeaderProps {

}

const ControlHeader: React.FC<ControlHeaderProps> = (props) => {
    return (
        <header>
            <HeaderButton>
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