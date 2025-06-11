import type { FilterDefinition } from "./filters"

export const examples: {
    title: string
    description: string
    filter: FilterDefinition
}[] = [
    {
        title: 'Long last names',
        description: 'This filter returns all individuals with a last name containing 12 or more characters.',
        filter: {
            type: 'CHILD RECORD',
            cardinality: 'any',
            childKey: 'NAME',
            filter: {
                type: 'STRING COMPARE',
                operation: 'regex',
                expression: {
                    type: 'STRING LITERAL',
                    value: /\s\w{12,}$/.source
                }
            }
        }
    },
    {
        title: 'Conflicting names',
        description: 'This filter returns all individuals with two or more conflicting name records.',
        filter: {
            type: 'AND',
            filters: [
                {
                    type: 'CHILD RECORD STORED',
                    cardinality: 'any',
                    childKey: 'NAME',
                    filter: {
                        type: 'NO-OP'
                    },
                    variable: 'name1'
                },
                {
                    type: 'CHILD RECORD',
                    cardinality: 'any',
                    childKey: 'NAME',
                    filter: {
                        type: 'NOT',
                        filter: {
                            type: 'STRING COMPARE',
                            operation: 'equals',
                            expression: {
                                type: 'STORED STRING',
                                variable: 'name1'
                            }
                        }
                    }
                }
            ]
        }
    }
]
