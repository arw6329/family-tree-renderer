import { NodeMetadata } from "@/lib/family-tree/FamilyTreeDatabase"
import "../MetadataFrame.scoped.css"
import { useState } from "react"
import Flex from "../../flex/Flex"
import { blankRecord } from "@/lib/family-tree/metadata-helpers"
import { range } from "@/lib/range"
import ComplexDateInput from "../../complex-date-input/ComplexDateInput"
import { getTypeOfValue, startExpanded, validChildrenOf } from "@/lib/family-tree/metadata-record-helpers"
import { IconContext } from "react-icons"
import { IoIosTrash } from "react-icons/io"
import { remove_elem } from "@/lib/array-utils/array-utils"
import TextareaAutosize from "react-autosize-textarea"
type MetadataChangeCallback = (metadata: NodeMetadata[]) => void

const Row: React.FC<{
    record: NodeMetadata & { type: 'simple' },
    depth: number,
    onChange: () => void,
    onDelete: () => void
}> = ({ record, depth, onChange, onDelete }) => {
    const type = getTypeOfValue(record.key)

    return (
        <div className="kv-table-row">
            {range(1, depth).map(() => <div className="depth-marker" />)}
            <Flex gap={5} alignItems="center" style={{ flexGrow: 1, padding: '10px' }}>
                <Flex gap={5} alignItems="center" wrap={true} style={{ flexGrow: 1 }}>
                    <label>{record.key}</label>
                    {type === 'date' && <ComplexDateInput
                        type="moment"
                        defaultValue={record.value}
                        onChange={(date) => {
                            record.value = date
                            onChange()
                        }}
                    />}
                    {type === 'text-short' && <input
                        type="text"
                        defaultValue={record.value}
                        onChange={(event) => {
                            record.value = event.target.value || null
                            onChange()
                        }}
                    />}
                    {type === 'text-long' && <TextareaAutosize
                        style={{ width: '100%', resize: 'none' }}
                        defaultValue={record.value}
                        onChange={(event) => {
                            record.value = event.target.value || null
                            onChange()
                        }}
                    />}
                    {type instanceof Object && type.type === 'enum' && <select
                        defaultValue={record.value}
                        onChange={(event) => {
                            record.value = event.target.value || null
                            onChange()
                        }}    
                    >
                        <option value="" />
                        {Object.entries(type.values).map(([key, prettyKey]) => <option value={key}>{prettyKey}</option>)}    
                    </select>}
                </Flex>
                <button aria-label={`Delete ${record.key} record`} onClick={onDelete}>
                    <IconContext.Provider value={{ style: { height: '100%', width: 27 } }}>
                        <IoIosTrash fill="rgb(143, 151, 155)" />
                    </IconContext.Provider>
                </button>
            </Flex>
        </div>
    )
}

function block(record: NodeMetadata, depth: number, onChange: () => void, onDelete: () => void) {
    const dereffedRecord = record.type === 'pointer' ? {
        type: 'simple' as const,
        key: '<pointerized>',
        value: '<pointerized>',
        children: record.children
    } : record

    const validChildren = validChildrenOf(dereffedRecord.key)

    if(validChildren.length || dereffedRecord.children.length) {
        return (
            <details className="kv-block" open={startExpanded(dereffedRecord.key)}>
                <summary>
                    <Row record={dereffedRecord} depth={depth} onChange={onChange} onDelete={onDelete} />
                </summary>
                <div className="content">
                    {dereffedRecord.children.map(child => block(child, depth + 1, onChange, () => {
                        remove_elem(dereffedRecord.children, child)
                        onChange()
                    }))}
                    <div className="kv-table-row">
                        {range(1, depth + 1).map(() => <div className="depth-marker" />)}
                        <Flex gap={5} alignItems="center" style={{ flexGrow: 1, padding: '10px' }}>
                            <label>Add record</label>
                            <select onChange={(event) => {
                                dereffedRecord.children.push(blankRecord(event.target.value))
                                event.target.value = ''
                                onChange()
                            }}>
                                <option value="">- Select record type -</option>
                                {validChildren.map(child => <option value={child}>{child}</option>)}
                            </select>
                        </Flex>
                    </div>
                </div>
            </details>
        )
    } else {
        return <Row record={dereffedRecord} depth={depth} onChange={onChange} onDelete={onDelete} />
    }
}

const EditableMetadataFrame: React.FC<{
    metadata: NodeMetadata[],
    legalRootKeys: string[],
    onMetadataChange: MetadataChangeCallback,
}> = ({ metadata, legalRootKeys, onMetadataChange }) => {
    const [newMetadata, setNewMetadata] = useState(structuredClone(metadata))
    return (
        <div className="frame-root">
            {newMetadata.map(record => block(record, 0, () => {
                const metadata = structuredClone(newMetadata)
                setNewMetadata(metadata)
                onMetadataChange(metadata)
            }, () => {
                remove_elem(newMetadata, record)
                const metadata = structuredClone(newMetadata)
                setNewMetadata(metadata)
                onMetadataChange(metadata)
            }))}
            <div className="kv-table-row">
                <Flex gap={5} alignItems="center" style={{ flexGrow: 1, padding: '10px' }}>
                    <label>Add record</label>
                    <select onChange={(event) => {
                        const metadata = structuredClone(newMetadata)
                        metadata.push(blankRecord(event.target.value))
                        setNewMetadata(metadata)
                        event.target.value = ''
                        onMetadataChange(metadata)
                    }}>
                        <option value="">- Select record type -</option>
                        {legalRootKeys.map(child => <option value={child}>{child}</option>)}
                    </select>
                </Flex>
            </div>
        </div>
    )
}

export default EditableMetadataFrame
