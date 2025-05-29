export type MetadataRecordValueType = 'date' | 'text-short' | 'text-long' | { type: 'enum', values: {[key: string]: string} } | 'none'

export function getTypeOfValue(key: string): MetadataRecordValueType {
    switch(key) {
        case 'DATE': {
            return 'date'
        }
        case 'NOTE': {
            return 'text-long'
        }
        case 'LOCATION':
        case 'LINK':
        case 'ADDRESS1': 
        case 'ADDRESS2': 
        case 'ADDRESS3': 
        case 'CITY': 
        case 'STATE': 
        case 'COUNTRY': {
            return 'text-short'
        }
        case 'PEDIGREE': {
            return {
                type: 'enum',
                values: {
                    'biological': 'Biological',
                    'adoptive': 'Adoptive',
                    'foster': 'Foster'
                }
            }
        }
        default: {
            return 'none'
        }
    }
}

const eventValidChildren = [ 'DATE', 'LOCATION', 'ADDRESS', 'NOTE', 'LINK' ]
export function validChildrenOf(key: string): string[] {
    switch(key) {
        case 'BIRTH':
        case 'BURIAL':
        case 'CREMATION':
        case 'ADOPTION':
        case 'GRADUATION':
        case 'RETIREMENT':
        case 'ENGAGEMENT':
        case 'DIVORCE':
        case 'NON_MARRIAGE_RELATIONSHIP':
            return eventValidChildren
        case 'MARRIAGE':
            return [ 'DIVORCE', ...eventValidChildren ]
        case 'DEATH':
            return [ 'CAUSE', ...eventValidChildren ]
        case 'ADDRESS':
            return [ 'ADDRESS1', 'ADDRESS2', 'ADDRESS3', 'CITY', 'STATE', 'POSTAL_CODE', 'COUNTRY', 'NOTE' ]
        case 'SOURCE':
            return [ 'TITLE', 'AUTHOR', 'ABBREVIATION', 'PUBLICATION', 'QUOTED_TEXT', 'NOTE', 'LINK' ]
        case 'REPOSITORY':
            return [ 'NAME', 'PHONE_NUMBER', 'EMAIL', 'ADDRESS', 'LINK', 'NOTE' ]
        case 'NOTE':
            return []
        default:
            return [ 'NOTE' ]
    }
}

export function startExpanded(key: string): boolean {
    switch(key) {
        case 'BIRTH':
        case 'DEATH':
        case 'MARRIAGE':
        case 'ADOPTION': 
        case 'FOSTER': {
            return true
        }
        default: {
            return false
        }
    }
}

export function prettyKey(key: string): string {
    return (key[0].toUpperCase() + key.slice(1).toLowerCase()).replaceAll('_', ' ')
}
