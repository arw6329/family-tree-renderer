import HeaderButton from "@/components/building-blocks/header-button/HeaderButton"
import "./ControlHeader.scoped.css"
import { useContext, useState } from "react"
import JumpToProfileOverlay from "@/components/overlays/JumpToProfileOverlay"
import { FamilyTreeStateContext } from "../FamilyTreeState"
import CreateProfileOverlay from "@/components/overlays/CreateProfileOverlay"
import { TbFocus2 } from "react-icons/tb"
import { IconContext } from "react-icons"
import { FaKeyboard, FaPerson } from "react-icons/fa6"
import { BiSolidZoomIn, BiSolidZoomOut } from "react-icons/bi"
import { MdEdit } from "react-icons/md"
import { FaArrowAltCircleRight } from "react-icons/fa"

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
                <HeaderButton imageButton={true} tooltip="Recenter" onClick={() => props.onRecenter()}>
                    <IconContext.Provider value={{ style: { height: 20, width: 20 } }}>
                        <TbFocus2 />
                    </IconContext.Provider>
                </HeaderButton>
            </li>
            <li>
                <HeaderButton imageButton={true} tooltip="Go to person" onClick={() => setSelectingUser(true)}>
                    <IconContext.Provider value={{ style: { height: 15, width: 15 } }}>
                        <FaArrowAltCircleRight />
                    </IconContext.Provider>
                    <IconContext.Provider value={{ style: { height: 18, width: 18 } }}>
                        <FaPerson />
                    </IconContext.Provider>
                </HeaderButton>
            </li>
            <li>
                <HeaderButton imageButton={true} tooltip="Zoom in" onClick={() => props.onZoomIn()}>
                    <IconContext.Provider value={{ style: { height: 20, width: 20 } }}>
                        <BiSolidZoomIn />
                    </IconContext.Provider>
                </HeaderButton>
            </li>
            <li>
                <HeaderButton imageButton={true} tooltip="Zoom out" onClick={() => props.onZoomOut()}>
                    <IconContext.Provider value={{ style: { height: 20, width: 20 } }}>
                        <BiSolidZoomOut />
                    </IconContext.Provider>
                </HeaderButton>
            </li>
            <li>
                <HeaderButton imageButton={true} tooltip="Show keyboard controls" onClick={() => props.onToggleKeyboardControlsMenu()}>
                    <IconContext.Provider value={{ style: { height: 20, width: 20 } }}>
                        <FaKeyboard />
                    </IconContext.Provider>
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
                    <HeaderButton imageButton={true} tooltip="Edit" onClick={() => state.setEditing(true)}>
                        <IconContext.Provider value={{ style: { height: 20, width: 20 } }}>
                            <MdEdit />
                        </IconContext.Provider>
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