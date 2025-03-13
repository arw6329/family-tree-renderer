import Flex from "@/components/building-blocks/flex/Flex"
import { Profile } from "@/lib/family-tree/FamilyTreeDatabase"
import { IconContext } from "react-icons"
import { FaMars, FaVenus } from "react-icons/fa6"
import { TbGenderGenderqueer } from "react-icons/tb"

const NameAndGender: React.FC<{ profile: Profile }> = ({ profile }) => {
    return (
        <Flex gap={6} alignItems="center">
            <span style={{ fontSize: '1.6rem', color: 'white' }}>{profile.name}</span>
            {profile.family_tree_gender === 'FEMALE'
                && <IconContext.Provider value={{ style: { height: 25 } }}>
                    <FaVenus fill="#ffb3c0" aria-label="Female gender symbol" />
                </IconContext.Provider>}
            {profile.family_tree_gender === 'MALE'
                && <IconContext.Provider value={{ style: { height: 27, width: 22 } }}>
                    <FaMars fill="cornflowerblue" aria-label="Male gender symbol" />
                </IconContext.Provider>}
            {profile.family_tree_gender === 'NONBINARY'
                && <IconContext.Provider value={{ style: { height: 28, width: 28, margin: '0 -5px' } }}>
                    <TbGenderGenderqueer stroke="yellow" aria-label="Nonbinary gender symbol" />
                </IconContext.Provider>}
        </Flex>
    )
}

export default NameAndGender
