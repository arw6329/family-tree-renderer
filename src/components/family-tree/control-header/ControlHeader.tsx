import HeaderButton from "@/components/building-blocks/header-button/HeaderButton"
import "./ControlHeader.scoped.css"
import { useContext, useState } from "react"
import JumpToProfileOverlay from "@/components/overlays/JumpToProfileOverlay"
import { FamilyTreeStateContext } from "../FamilyTreeState"
import CreateProfileOverlay from "@/components/overlays/CreateProfileOverlay"

interface ControlHeaderProps {
    onRecenter: () => void
    onZoomIn: () => void
    onZoomOut: () => void
    onToggleKeyboardControlsMenu: () => void
}

const ControlHeader: React.FC<ControlHeaderProps> = (props) => {
    const state = useContext(FamilyTreeStateContext)
    const [selectingUser, setSelectingUser] = useState(false)
    const [creatingUser, setCreatingUser] = useState(false)
    const [moreOptionsShown, setMoreOptionsShown] = useState(false)

    return (<>
        <menu>
            <li>
                <HeaderButton onClick={() => props.onRecenter()}>
                    <span>Recenter</span>
                </HeaderButton>
            </li>
            <li>
                <HeaderButton onClick={() => setSelectingUser(true)}>
                    <span>Jump to person</span>
                </HeaderButton>
            </li>
            <li>
                <HeaderButton onClick={() => props.onZoomIn()}>
                    <span>Zoom in</span>
                </HeaderButton>
            </li>
            <li>
                <HeaderButton onClick={() => props.onZoomOut()}>
                    <span>Zoom out</span>
                </HeaderButton>
            </li>
            <li>
                <HeaderButton onClick={() => props.onToggleKeyboardControlsMenu()}>
                    <span>Toggle keyboard menu</span>
                </HeaderButton>
            </li>
            {
                state.editing
                ? <li>
                    <HeaderButton onClick={() => state.setEditing(false)}>
                        <span>Exit edit mode</span>
                    </HeaderButton>
                </li>
                : <li>
                    <HeaderButton onClick={() => state.setEditing(true)}>
                        <span>Edit</span>
                    </HeaderButton>
                </li>
            }
            {
                state.editing && (!moreOptionsShown
                ? <li>
                    <HeaderButton onClick={() => setMoreOptionsShown(true)}>
                        <span>More</span>
                    </HeaderButton>
                </li>
                : <li>
                    <HeaderButton onClick={() => setMoreOptionsShown(false)}>
                        <span>Less</span>
                    </HeaderButton>
                </li>)
            }
        </menu>
        {moreOptionsShown && state.editing && <menu>
            <li>
                <HeaderButton onClick={() => setCreatingUser(true)}>
                    <span>Create unconnected person</span>
                </HeaderButton>
            </li>
        </menu>}
        {selectingUser && <JumpToProfileOverlay onFinished={() => setSelectingUser(false)} />}
        {creatingUser && <CreateProfileOverlay onFinished={() => setCreatingUser(false)} />}
    </>)
}

export default ControlHeader