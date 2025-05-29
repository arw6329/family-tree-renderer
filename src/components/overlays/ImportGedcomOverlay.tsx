import { useContext, useState } from "react"
import { FamilyTreeStateContext } from "../family-tree/FamilyTreeState"
import SectionedDialog from "../building-blocks/sectioned-dialog/SectionedDialog"
import ActionButton from "../building-blocks/action-button/ActionButton"
import Flex from "../building-blocks/flex/Flex"
import { parseGedcom } from "@/lib/family-tree/gedcom/gedcom"
import { fileListToJsonDirectory, fuzzyFindFileInDirectory } from "@/lib/util/file"

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
    const [gedcomFile, setGedcomFile] = useState<File | null>(null)
    const [mediaFileList, setMediaFileList] = useState<FileList | null>(null)

    return (
        <SectionedDialog
            onClose={onFinished}
            header={
                <span>Import a GEDCOM file</span>
            }
            main={
                <>
                    <input type="file" onChange={evt => setGedcomFile(evt.target.files?.[0] ?? null)} />
                    <input type="file" webkitdirectory="true" onChange={evt => setMediaFileList(evt.target.files ?? null)} />
                </>
            }
            footer={
                <Flex gap={6}>
                    <ActionButton disabled={!gedcomFile} onClick={async () => {
                        const database = parseGedcom(await readFile(gedcomFile!))
                        const directory = mediaFileList ? fileListToJsonDirectory(mediaFileList) : null

                        state.replaceDatabase(database)
                        state.setFileURLProvider(filePath => {
                            if(directory) {
                                const file = fuzzyFindFileInDirectory(filePath, directory)
                                if(file) {
                                    // TODO: URL is never revoked. Is this a big deal?
                                    // Should probably find a way to revoke when all images using it are lost.
                                    return URL.createObjectURL(file)
                                }
                            }
                            return null
                        })

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
