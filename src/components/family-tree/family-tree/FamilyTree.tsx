import { FamilyTreeDatabase } from "@/lib/family-tree/FamilyTreeDatabase"
import { FamilyTreeStateProvider } from "../FamilyTreeState"
import FamilyTreeRenderer from "../family-tree-renderer/FamilyTreeRenderer"

const FamilyTree: React.FC<{ database: FamilyTreeDatabase }> = ({ database }) => {
    return (
        <FamilyTreeStateProvider database={database}>
            <FamilyTreeRenderer />
        </FamilyTreeStateProvider>
    )
}

export default FamilyTree