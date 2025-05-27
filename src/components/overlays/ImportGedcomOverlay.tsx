import { useContext, useState } from "react"
import { FamilyTreeStateContext } from "../family-tree/FamilyTreeState"
import SectionedDialog from "../building-blocks/sectioned-dialog/SectionedDialog"
import ActionButton from "../building-blocks/action-button/ActionButton"
import Flex from "../building-blocks/flex/Flex"
import { parseGedcom } from "@/lib/family-tree/gedcom/gedcom"

function readFile(file: File): Promise<string> {
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.addEventListener('load', () => {
            resolve(reader.result as string)
        })
        reader.readAsText(file)
    })
}

const ImportGedcomOverlay: React.FC<{ onFinished: () => void }> = ({ onFinished }) => {
    const state = useContext(FamilyTreeStateContext)
    const [file, setFile] = useState<File | null>(null)

    return (
        <SectionedDialog
            onClose={onFinished}
            header={
                <span>Import a GEDCOM file</span>
            }
            main={
                <input type="file" onChange={evt => setFile(evt.target.files?.[0] ?? null)} />
            }
            footer={
                <Flex gap={6}>
                    <ActionButton disabled={!file} onClick={async () => {
                        const database = parseGedcom(await readFile(file!))
                        state.replaceDatabase(database)
                        onFinished()
                    }}>
                        <span>Import</span>
                    </ActionButton>
                    <ActionButton onClick={() => onFinished()}>
                        <span>Cancel</span>
                    </ActionButton>
                </Flex>
            }
        />
    )
}

export default ImportGedcomOverlay
