import { NodeMetadata } from "@/lib/family-tree/FamilyTreeDatabase"
import "./MetadataFrame.scoped.css"
import { range } from "@/lib/range"
import { recordValueToString } from "./record-value-to-string"
import Flex from "../flex/Flex"
import { prettyKey, startExpanded } from "@/lib/family-tree/metadata-record-helpers"
import { derefRecord } from "@/lib/family-tree/metadata-helpers"

const Row: React.FC<{
    record: NodeMetadata & { type: 'simple' }
    depth: number
}> = ({ record, depth }) => {
    return (
        <div className="kv-table-row">
            {range(1, depth).map((i) => <div key={i} className="depth-marker" />)}
            <Flex gap={5} alignItems="center" wrap={true} style={{ flexGrow: 1, padding: 10 }}>
                <span className="label">{prettyKey(record.key)}</span>
                {
                    typeof record.value === 'string' && record.value.match(/^https?:\/\//)
                    ? <a target="_blank" href={record.value}>{record.value}</a>
                    : <span style={{ whiteSpace: 'pre-wrap' }}>{recordValueToString(record)}</span>
                }
            </Flex>
        </div>
    )
}

function block(
    record: NodeMetadata,
    metadataLookup: (id: string) => NodeMetadata | null,
    depth: number,
    key: string = ''
) {
    const dereffedRecord = derefRecord(record, metadataLookup)

    if(dereffedRecord.children.length) {
        return (
            <details key={key} className="kv-block" open={startExpanded(dereffedRecord.key)}>
                <summary>
                    <Row record={dereffedRecord} depth={depth} />
                </summary>
                <div className="content">
                    {dereffedRecord.children.map((child, i) => block(child, metadataLookup, depth + 1, `${key}:${i}`))}
                </div>
            </details>
        )
    } else {
        return <Row key={key} record={dereffedRecord} depth={depth} />
    }
}

const MetadataFrame: React.FC<{
    metadata: NodeMetadata[]
    metadataLookup: (id: string) => NodeMetadata | null
}> = ({ metadata, metadataLookup }) => {
    return (
        <div className="frame-root">
            {metadata.map((record, i) => block(record, metadataLookup, 0, i.toString()))}
        </div>
    )
}

export default MetadataFrame
