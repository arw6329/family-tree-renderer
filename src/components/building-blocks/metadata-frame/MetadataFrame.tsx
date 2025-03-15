import { NodeMetadata } from "@/lib/family-tree/FamilyTreeDatabase"
import "./MetadataFrame.scoped.css"
import { range } from "@/lib/range"
import { recordValueToString } from "./record-value-to-string"
import Flex from "../flex/Flex"
import { startExpanded } from "@/lib/family-tree/metadata-record-helpers"

const Row: React.FC<{
    record: NodeMetadata & { type: 'simple' }
    depth: number
}> = ({ record, depth }) => {
    return (
        <div className="kv-table-row">
            {range(1, depth).map(() => <div className="depth-marker" />)}
            <Flex gap={5} alignItems="center" wrap={true} style={{ flexGrow: 1, padding: 10 }}>
                <label>{record.key}</label>
                <span>{recordValueToString(record)}</span>
            </Flex>
        </div>
    )
}

function block(record: NodeMetadata, depth: number) {
    const dereffedRecord = record.type === 'pointer' ? {
        type: 'simple' as const,
        key: '<pointerized>',
        value: '<pointerized>',
        children: record.children
    } : record

    if(dereffedRecord.children.length) {
        return (
            <details className="kv-block" open={startExpanded(dereffedRecord.key)}>
                <summary>
                    <Row record={dereffedRecord} depth={depth} />
                </summary>
                <div className="content">
                    {dereffedRecord.children.map(child => block(child, depth + 1))}
                </div>
            </details>
        )
    } else {
        return <Row record={dereffedRecord} depth={depth} />
    }
}

const MetadataFrame: React.FC<{ metadata: NodeMetadata[] }> = ({ metadata }) => {
    return (
        <div className="frame-root">
            {metadata.map(record => block(record, 0))}
        </div>
    )
}

export default MetadataFrame
