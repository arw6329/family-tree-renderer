import AddNodeButton from "../add-node-button/AddNodeButton"
import { useState } from "react"
import { Profile } from "@/lib/family-tree/FamilyTreeDatabase"
import AddSpouseOverlay from "@/components/overlays/AddSpouseOverlay"

const AddSpouseButton: React.FC<{ x: number, y: number, withProfile: Profile }> = ({ x, y, withProfile }) => {
    const [popupActive, setPopupActive] = useState(false)

    return (
        <>
            <AddNodeButton x={x} y={y} onClick={() => setPopupActive(true)} />
            {popupActive && <foreignObject>
                <AddSpouseOverlay withProfile={withProfile} onFinished={() => setPopupActive(false)} />
            </foreignObject>}
        </>
    )
}

export default AddSpouseButton
