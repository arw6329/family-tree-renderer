import { isComplexDate, prettyDate } from "@/lib/family-tree/date-utils"
import { NodeMetadata } from "@/lib/family-tree/FamilyTreeDatabase"

export function recordValueToString(record: NodeMetadata & { type: 'simple' }): string {
    if(record.value === null) {
        return ''
    } else if(typeof record.value === 'string' || typeof record.value === 'number') {
        return record.value.toString()
    } else if(isComplexDate(record.value)) {
        return prettyDate(record.value)
    } else {
        return '(unknown value format)'
    }
}
