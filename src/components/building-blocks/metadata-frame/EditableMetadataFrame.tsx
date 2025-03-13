import { NodeMetadata } from "@/lib/family-tree/FamilyTreeDatabase"
import "./MetadataFrame.scoped.css"
import { range } from "@/lib/range"
import { ReactElement, ReactNode, useState } from "react"
import Flex from "../flex/Flex"
import { isMetadataSimple, SimpleMetadataSpec } from "@/lib/family-tree/metadata-helpers"

type MetadataChangeCallback = (metadata: NodeMetadata[]) => void

function row(record: NodeMetadata, depth: number) {
    return (
        <div className="kv-table-row">
            {range(1, depth).map(() => <div className="depth-marker" />)}
            <div className="label-value-wrapper">
                <label>{record.key}</label>
                <span>{record.value}</span>
            </div>
        </div>
    )
}

function block(record: NodeMetadata, depth: number) {
    const dereffedRecord = record.type === 'pointer' ? {
        type: 'simple' as const,
        key: '<pointerized>',
        value: '<pointerized>',
        children: record.children
    } : {
        type: record.type,
        key: record.key,
        value: record.value?.toString() ?? null,
        children: record.children
    }

    if (dereffedRecord.children.length) {
        return (
            <details className="kv-block">
                <summary>{row(dereffedRecord, depth)}</summary>
                <div className="content">
                    {record.children.map(child => block(child, depth + 1))}
                </div>
            </details>
        )
    } else {
        return row(dereffedRecord, depth)
    }
}

const EditableMetadataFrame: React.FC<{
    metadata: NodeMetadata[],
    simpleSchema: SimpleMetadataSpec,
    onMetadataChange: MetadataChangeCallback,
    simpleRepresentation: (metadata: NodeMetadata[], onMetadataChange: MetadataChangeCallback) => ReactElement<{ onMetadataChange: MetadataChangeCallback }>
}> = ({ metadata, simpleSchema, onMetadataChange, simpleRepresentation }) => {
    const [simple, setSimple] = useState(isMetadataSimple(metadata, simpleSchema))
    const [newMetadata, setNewMetadata] = useState(metadata)
    return (
        <Flex column={true} gap={12}>
            <div>
                <button onClick={() => setSimple(true)}>simple</button>
                <button onClick={() => setSimple(false)}>advanced</button>
            </div>
            {simple ? simpleRepresentation(newMetadata, (metadata) => {
                setNewMetadata(metadata)
                onMetadataChange(metadata)
            }) : <div className="frame-root">
                {newMetadata.map(record => block(record, 0))}
            </div>}
        </Flex>
    )
}

export default EditableMetadataFrame
