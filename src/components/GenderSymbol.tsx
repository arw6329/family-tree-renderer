import type { Profile } from "@/lib/family-tree/FamilyTreeDatabase"
import { IconContext } from "react-icons"
import { FaMars, FaVenus } from "react-icons/fa6"
import { TbGenderGenderqueer } from "react-icons/tb"

function hw(size: 'large' | 'small', largeDims: [number, number], smallDims: [number, number]) {
    return size === 'large' ? {
        height: largeDims[0],
        width: largeDims[1],
        flex: `0 0 ${largeDims[1]}px`
    } : {
        height: smallDims[0],
        width: smallDims[1],
        flex: `0 0 ${smallDims[1]}px`
    }
}

const GenderSymbol: React.FC<{
    gender: Profile['family_tree_gender']
    size?: 'large' | 'small'
}> = ({ gender, size = 'large' }) => {
    switch(gender) {
        case 'FEMALE': {
            return <IconContext.Provider value={{ style: hw(size, [25, 25], [17, 13]) }}>
                <FaVenus fill="#ffb3c0" aria-label="Female gender symbol" />
            </IconContext.Provider>
        }
        case 'MALE': {
            return <IconContext.Provider value={{ style: hw(size, [27, 22], [20, 17]) }}>
                <FaMars fill="cornflowerblue" aria-label="Male gender symbol" />
            </IconContext.Provider>
        }
        case 'NONBINARY': {
            return <IconContext.Provider value={{ style: { height: 28, width: 28, margin: '0 -5px' } }}>
                <TbGenderGenderqueer stroke="yellow" aria-label="Nonbinary gender symbol" />
            </IconContext.Provider>
        }
    }
}

export default GenderSymbol
